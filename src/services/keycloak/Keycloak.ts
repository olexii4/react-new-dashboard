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

import { injectable } from 'inversify';
import { KeycloakInstance } from 'keycloak-js';
import { getDefer, IDeferred } from '../helpers/deferred';
import { KeycloakSetupService } from '../bootstrap/KeycloakSetup';

export type IKeycloakUserInfo = {
  email: string;
  family_name: string;
  given_name: string;
  preferred_username: string;
  sub: string;
};

/**
 * This class is handling interactions with Keycloak
 */
@injectable()
export class KeycloakService {

  fetchUserInfo(): Promise<IKeycloakUserInfo> {
    const defer: IDeferred<IKeycloakUserInfo> = getDefer();

    if (!KeycloakSetupService.keycloakAuth.keycloak) {
      defer.reject('Keycloak is not found on the page.');
      return defer.promise;
    }

    (KeycloakSetupService.keycloakAuth.keycloak as any).loadUserInfo().success((userInfo: IKeycloakUserInfo) => {
      defer.resolve(userInfo);
    }).error((error: any) => {
      defer.reject(`User info fetching failed, error: ${error}`);
    });

    return defer.promise;
  }

  async updateToken(minValidity: number): Promise<void> {
    const keycloak = KeycloakSetupService.keycloakAuth.keycloak as any;
    if (!keycloak || !keycloak.updateToken) {
      return;
    }
    try {
      await keycloak.updateToken(minValidity);
    } catch (e) {
      window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
      if (keycloak && keycloak.login) {
        keycloak.login();
      }
      throw new Error('Failed to update token. \n' + e);
    }
  }

  isPresent(): boolean {
    return KeycloakSetupService.keycloakAuth.sso;
  }

  getProfileUrl(): string {
    const keycloak: any = KeycloakSetupService.keycloakAuth.keycloak;
    return keycloak && keycloak.createAccountUrl ? keycloak.createAccountUrl() : '';
  }

  logout(): void {
    window.sessionStorage.removeItem('githubToken');
    window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
    const keycloak = KeycloakSetupService.keycloakAuth.keycloak as any;
    if (keycloak && keycloak.logout) {
      keycloak.logout({});
    }
  }

}
