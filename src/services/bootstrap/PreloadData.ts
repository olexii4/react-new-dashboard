import { container } from '../../inversify.config';
import { KeycloakSetup } from './KeycloakSetup';
import { CheBranding } from './CheBranding';
import * as BrandingStore from '../../store/Branding';
import * as UserStore from '../../store/User';
import * as WorkspacesStore from '../../store/Workspaces';
import * as DevfileMetadataStore from '../../store/DevfileMetadata';
import * as DevfileMetadataFiltersStore from '../../store/DevfileFilters';
import { Keycloak } from '../keycloak/Keycloak';
import { Store } from 'redux';

/**
 * This class prepares all init data.
 * @author Oleksii Orel
 */
export class PreloadData {
  private cheBranding: CheBranding;
  private keycloakSetup: KeycloakSetup;
  private keycloak: Keycloak;
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    this.cheBranding = container.get(CheBranding);
    this.keycloakSetup = container.get(KeycloakSetup);
    this.keycloak = container.get(Keycloak);
  }

  async init(): Promise<void> {
    this.setBranding();// default values for a loader
    this.updateBranding();
    await this.updateUser();
    await this.updateKeycloakUserInfo();

    const settings = await this.updateWorkspaceSettings();

    this.updateWorkspaces();
    await this.updateDevfilesMetadata(settings);
    this.updateDevfileMetadataFilters();
  }

  private setBranding(): void {
    const branding = this.cheBranding.all;
    this.store.dispatch(BrandingStore.setBranding({ branding }));
  }

  private updateBranding(): void {
    this.cheBranding.ready.then(() => {
      this.setBranding();
    });
  }

  private setUser(): void {
    const user = this.keycloakSetup.getUser();
    this.store.dispatch(UserStore.setUser({ user }));
  }

  private async updateUser(): Promise<void> {
    await this.keycloakSetup.resolve();
    this.setUser();
  }

  private async updateWorkspaces(): Promise<void> {
    const requestWorkspaces = WorkspacesStore.actionCreators.requestWorkspaces;
    await requestWorkspaces()(this.store.dispatch, this.store.getState);
  }

  private async updateWorkspaceSettings(): Promise<che.WorkspaceSettings> {
    const requestSettings = WorkspacesStore.actionCreators.requestSettings;
    return requestSettings()(this.store.dispatch, this.store.getState);
  }

  private async updateDevfilesMetadata(settings: che.WorkspaceSettings): Promise<void> {
    const requestMetadata = DevfileMetadataStore.actionCreators.requestMetadata;
    return requestMetadata(settings.cheWorkspaceDevfileRegistryUrl || '')(this.store.dispatch, this.store.getState);
  }

  private updateDevfileMetadataFilters(): void {
    const showAll = DevfileMetadataFiltersStore.actionCreators.showAll;
    return showAll()(this.store.dispatch, this.store.getState);
  }

  private async updateKeycloakUserInfo(): Promise<void> {
    if (!KeycloakSetup.keycloakAuth.isPresent) {
      return;
    }
    const userInfo = await this.keycloak.fetchUserInfo();
    const user = Object.assign({}, this.keycloakSetup.getUser(), userInfo);
    this.store.dispatch(UserStore.setUser({ user }));
  }
}
