import { container } from '../../inversify.config';
import { KeycloakSetup } from './KeycloakSetup';
import { CheBranding } from './CheBranding';
import { setBranding } from '../../store/Branding';
import { setUser } from '../../store/User';
import * as WorkspacesStore from '../../store/Workspaces';
import * as DevfilesRegistry from '../../store/DevfilesRegistry';
import { Keycloak, IKeycloakUserInfo } from '../keycloak/Keycloak';
import * as $ from 'jquery';

/**
 * This class prepares all init data.
 * @author Oleksii Orel
 */
export class PreloadData {
  private cheBranding: CheBranding;
  private keycloakSetup: KeycloakSetup;
  private keycloak: Keycloak;
  private store: any;

  constructor(store: any) {
    this.store = store;
    this.cheBranding = container.get(CheBranding);
    this.keycloakSetup = container.get(KeycloakSetup);
    this.keycloak = container.get(Keycloak);
  }

  async init(): Promise<void> {
    this.setBranding();// default values for a loader
    this.updateBranding();
    await this.updateUser().then(() => {
      this.updateKeycloakUserInfo();
      this.updateWorkspaces();
      this.updateDevfilesRegistry();
    });

  }

  private setBranding(): void {
    const branding = this.cheBranding.all;
    this.store.dispatch(setBranding({ branding }));
  }

  private updateBranding(): void {
    this.cheBranding.ready.then(() => {
      this.setBranding();
    });
  }

  private setUser(): void {
    const user = this.keycloakSetup.getUser();
    this.store.dispatch(setUser({ user }));
  }

  private updateUser(): Promise<void> {
    return this.keycloakSetup.resolve().then(() => {
      this.setUser();
    });
  }

  private updateWorkspaces(): void {
    const requestWorkspaces = WorkspacesStore.actionCreators.requestWorkspaces;
    requestWorkspaces()(this.store.dispatch, () => ({ workspaces: { workspaces: [] } } as any));
  }

  private updateDevfilesRegistry(): void {
    const requestWorkspaces = DevfilesRegistry.actionCreators.requestDevfiles;
    requestWorkspaces()(this.store.dispatch, () => ({ devfilesRegistry: { data: [] } } as any));
  }

  private updateKeycloakUserInfo(): void {
    if (!KeycloakSetup.keycloakAuth.isPresent) {
      return;
    }
    this.keycloak.fetchUserInfo().then((userInfo: IKeycloakUserInfo) => {
      const user = $.extend(this.keycloakSetup.getUser(), userInfo);
      this.store.dispatch(setUser({ user }));
    });
  }
}
