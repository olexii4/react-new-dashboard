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

import 'reflect-metadata';
import 'keycloak-js';
import axios from 'axios';
import { injectable } from 'inversify';
import { KeycloakInstance } from 'keycloak-js';

/**
 * This class is handling the keycloak settings data.
 * @author Oleksii Orel
 */
@injectable()
export class KeycloakSetup {

  static keycloakAuth = {
    isPresent: false,
    keycloak: null,
    config: null
  };

  private static isDocumentReady = new Promise<void>(resolve => {
    const state = document.readyState;
    if (state === 'interactive' || state === 'complete') {
      resolve();
    } else {
      document.onreadystatechange = (): void => resolve();
    }
  });

  private user: che.User | {} = {};

  async start(): Promise<void> {
    if (KeycloakSetup.keycloakAuth.isPresent) {
      return;
    }

    // initialize keycloak adapter
    try {
      const keycloakSettings = await this.fetchSettings();
      KeycloakSetup.keycloakAuth.config = this.buildKeycloakConfig(keycloakSettings);

      const src = keycloakSettings['che.keycloak.js_adapter_url'];
      await this.loadAdapterScript(src);

      const keycloak = await this.keycloakInit(KeycloakSetup);

      KeycloakSetup.keycloakAuth.isPresent = true;
      KeycloakSetup.keycloakAuth.keycloak = keycloak;
      (window as any)['_keycloak'] = keycloak;
    } catch (e) {
      console.error('Keycloak initialization failed: ', e);
    }

    // test API
    try {
      const keycloak = (window as any)._keycloak;
      const endpoint = '/api/user';
      const result = await this.testApiAttainability<che.User>(keycloak, endpoint);
      this.user = result;
    } catch (e) {
      throw new Error('Failed to get response to API endpoint: \n' + e);
    }
  }

  private async fetchSettings(): Promise<any> {
    try {
      const response = await axios.get('/api/keycloak/settings');
      return response.data;
    } catch (e) {
      throw new Error('Failed get keycloak settings.');
    }
  }

  private async loadAdapterScript(src: string): Promise<void> {
    await KeycloakSetup.isDocumentReady;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = src;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', e => {
        reject(new Error(e.toString()));
      });
      script.addEventListener('abort', () => {
        reject(new Error('Loader loading aborted.'));
      });
      document.head.appendChild(script);
    });
  }

  getUser(): che.User | {} {
    return this.user;
  }

  private buildKeycloakConfig(keycloakSettings: any): any {
    const theOidcProvider = keycloakSettings['che.keycloak.oidc_provider'];
    if (!theOidcProvider) {
      return {
        url: keycloakSettings['che.keycloak.auth_server_url'],
        realm: keycloakSettings['che.keycloak.realm'],
        clientId: keycloakSettings['che.keycloak.client_id']
      };
    } else {
      return {
        oidcProvider: theOidcProvider,
        clientId: keycloakSettings['che.keycloak.client_id']
      };
    }
  }

  private async keycloakInit(keycloakSettings: any): Promise<any> {
    let useNonce = false;
    if (typeof keycloakSettings['che.keycloak.use_nonce'] === 'string') {
      useNonce = keycloakSettings['che.keycloak.use_nonce'].toLowerCase() === 'true';
    }
    const initOptions = {
      useNonce,
    };

    if (!window.Keycloak) {
      throw new Error('Keycloak Adapter not found.');
    }

    const keycloak = window.Keycloak(keycloakSettings.keycloakAuth.config);
    window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);

    return new Promise((resolve, reject) => {
      keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        useNonce: initOptions['useNonce'],
      }).success(() => {
        resolve(keycloak);
      }).error((error: any) => {
        reject(new Error(error));
      });
    });
  }

  private async testApiAttainability<T>(keycloak: KeycloakInstance, endpoint: string): Promise<T> {
    try {
      await this.setAuthorizationHeader(keycloak);
      const response = await axios.get(endpoint);
      return response.data;
    } catch (e) {
      throw new Error(`Failed request to "${endpoint}". \n` + e);
    }
  }

  private async setAuthorizationHeader(keycloak: KeycloakInstance): Promise<void> {
    if (!keycloak) {
      return;
    }

    try {
      await this.updateToken(keycloak);
    } catch (e) {
      window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
      keycloak.login();
      throw new Error('Authorization is needed. \n' + e);
    }

    axios.interceptors.request.use(config => {
      config.headers['Authorization'] = `Bearer ${keycloak.token}`;
      return config;
    });
  }

  private async updateToken(keycloak: KeycloakInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      keycloak.updateToken(5).success(() => {
        resolve();
      }).error(() => {
        reject(new Error('Failed to update token.'));
      });
    });
  }

}
