/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { container } from '../../inversify.config';
import { KeycloakSetup } from './KeycloakSetup';
import * as BrandingStore from '../../store/Branding';
import * as UserStore from '../../store/User';
import * as WorkspacesStore from '../../store/Workspaces';
import * as DevfileRegistriesStore from '../../store/DevfileRegistries';
import * as DevfileMetadataFiltersStore from '../../store/DevfileFilters';
import * as InfrastructureNamespaceStore from '../../store/InfrastructureNamespace';
import { Keycloak } from '../keycloak/Keycloak';
import { Store } from 'redux';

/**
 * This class prepares all init data.
 * @author Oleksii Orel
 */
export class PreloadData {
  private keycloakSetup: KeycloakSetup;
  private keycloak: Keycloak;
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    this.keycloakSetup = container.get(KeycloakSetup);
    this.keycloak = container.get(Keycloak);
  }

  async init(): Promise<void> {
    await this.updateBranding();
    await this.updateUser();
    await this.updateKeycloakUserInfo();

    this.updateWorkspaces();
    this.updateInfrastructureNamespaces();

    const settings = await this.updateWorkspaceSettings();
    await this.updateRegistriesMetadata(settings);
    await this.updateDevfileSchema();

    this.updateDevfileMetadataFilters();
  }

  private async updateBranding(): Promise<void> {
    const { requestBranding } = BrandingStore.actionCreators;
    await requestBranding()(this.store.dispatch, this.store.getState);
  }

  private setUser(): void {
    const user = this.keycloakSetup.getUser();
    this.store.dispatch(UserStore.setUser({ user }));
  }

  private async updateUser(): Promise<void> {
    await this.keycloakSetup.start();
    this.setUser();
  }

  private async updateWorkspaces(): Promise<void> {
    const { requestWorkspaces } = WorkspacesStore.actionCreators;
    await requestWorkspaces()(this.store.dispatch, this.store.getState);
  }

  private async updateInfrastructureNamespaces(): Promise<void> {
    const { requestNamespaces } = InfrastructureNamespaceStore.actionCreators;
    await requestNamespaces()(this.store.dispatch, this.store.getState);
  }

  private async updateWorkspaceSettings(): Promise<che.WorkspaceSettings> {
    const { requestSettings } = WorkspacesStore.actionCreators;
    return requestSettings()(this.store.dispatch, this.store.getState);
  }

  private async updateRegistriesMetadata(settings: che.WorkspaceSettings): Promise<void> {
    const { requestRegistriesMetadata } = DevfileRegistriesStore.actionCreators;
    return requestRegistriesMetadata(settings.cheWorkspaceDevfileRegistryUrl || '')(this.store.dispatch, this.store.getState);
  }

  private updateDevfileMetadataFilters(): void {
    const { showAll } = DevfileMetadataFiltersStore.actionCreators;
    return showAll()(this.store.dispatch, this.store.getState);
  }

  private async updateDevfileSchema(): Promise<void> {
    const { requestJsonSchema } = DevfileRegistriesStore.actionCreators;
    return requestJsonSchema()(this.store.dispatch, this.store.getState);
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
