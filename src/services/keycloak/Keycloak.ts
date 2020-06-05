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
import { getDefer, IDeferred } from '../deferred';
import { KeycloakSetup } from '../bootstrap/KeycloakSetup';

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
export class Keycloak {

  fetchUserInfo(): Promise<IKeycloakUserInfo> {
    const defer: IDeferred<IKeycloakUserInfo> = getDefer();

    if (!KeycloakSetup.keycloakAuth.keycloak) {
      defer.reject('Keycloak is not found on the page.');
      return defer.promise;
    }

    (KeycloakSetup.keycloakAuth.keycloak as any).loadUserInfo().success((userInfo: IKeycloakUserInfo) => {
      defer.resolve(userInfo);
    }).error((error: any) => {
      defer.reject(`User info fetching failed, error: ${error}`);
    });

    return defer.promise;
  }

  updateToken(validityTime: number): Promise<boolean> {
    const deferred: IDeferred<boolean> = getDefer();

    if (!KeycloakSetup.keycloakAuth.keycloak) {
      deferred.reject();
      return deferred.promise;
    }
    (KeycloakSetup.keycloakAuth.keycloak as any).updateToken(validityTime).success((refreshed: boolean) => {
      deferred.resolve(refreshed);
    }).error((error: any) => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  isPresent(): boolean {
    return KeycloakSetup.keycloakAuth.isPresent
  }

  getProfileUrl(): string {
    const keycloak: any = KeycloakSetup.keycloakAuth.keycloak;
    return keycloak && keycloak.createAccountUrl ? keycloak.createAccountUrl() : '';
  }

  logout(): void {
    window.sessionStorage.removeItem('githubToken');
    window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
    const keycloak: any = KeycloakSetup.keycloakAuth.keycloak;
    if (keycloak && keycloak.logout) {
      keycloak.logout({});
    }
  }

}
