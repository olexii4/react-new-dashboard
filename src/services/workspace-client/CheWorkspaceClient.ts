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
import WorkspaceClient, { IWorkspaceMasterApi, IRemoteAPI } from '@eclipse-che/workspace-client';
import { KeycloakSetup } from '../bootstrap/KeycloakSetup';

/**
 * This class manages the api connection.
 */
@injectable()
export class CheWorkspaceClient {
  private originLocation: string;
  private baseUrl: string;
  private websocketContext: string;
  private _restApiClient: IRemoteAPI;
  private _jsonRpcMasterApi: IWorkspaceMasterApi;

  /**
   * Default constructor that is using resource.
   */
  constructor() {
    this.baseUrl = '/api';
    this.websocketContext = '/api/websocket';

    this.originLocation = new URL(window.location.href).origin;

    // todo change this temporary solution after adding the proper method to workspace-client https://github.com/eclipse/che/issues/18311
    const axios = (WorkspaceClient as any).createAxiosInstance({ loggingEnabled: false });
    if (axios) {
      let isUpdated: boolean;
      const updateTimer = () => {
        if (!isUpdated) {
          isUpdated = true;
          setTimeout(() => {
            isUpdated = false;
          }, 30000);
        }
      };
      updateTimer();
      axios.interceptors.request.use(async request => {
        const keycloak = KeycloakSetup.keycloakAuth.keycloak as any;
        if (keycloak && keycloak.updateToken && !isUpdated) {
          updateTimer();
          try {
            await new Promise((resolve, reject) => {
              keycloak.updateToken(5).success((refreshed: boolean) => {
                if (refreshed && keycloak.token && axios.defaults && axios.defaults.headers && axios.defaults.headers.common) {
                  const header = 'Authorization';
                  axios.defaults.headers.common[header] = `Bearer ${keycloak.token}`;
                }
                resolve(keycloak);
              }).error((error: any) => {
                reject(new Error(error));
              });
            });
          } catch (e) {
            console.error('Failed to update token.', e);
            window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
            if (keycloak.login) {
              keycloak.login();
            }
          }
        }
        return request;
      });
    }
  }

  private get token(): string | null {
    const keycloak = KeycloakSetup.keycloakAuth.keycloak;
    return keycloak ? keycloak['token'] : null;
  }

  get restApiClient(): IRemoteAPI {
    // Lazy initialization of restApiClient
    if (!this._restApiClient) {
      this.updateRestApiClient();
    }
    return this._restApiClient;
  }

  get jsonRpcMasterApi(): IWorkspaceMasterApi {
    // Lazy initialization of restApiClient
    if (!this._jsonRpcMasterApi) {
      this.updateJsonRpcMasterApi();
    }
    return this._jsonRpcMasterApi;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getWebsocketContext(): string {
    return this.websocketContext;
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  setWebsocketContext(websocketContext: string): void {
    this.websocketContext = websocketContext;
  }

  updateRestApiClient(): void {
    const baseUrl = this.baseUrl;
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    this._restApiClient = WorkspaceClient.getRestApi({ baseUrl, headers });
  }

  async updateJsonRpcMasterApi(): Promise<void> {
    let jsonRpcApiLocation = this.originLocation.replace('http', 'ws') + this.websocketContext;
    this._jsonRpcMasterApi = WorkspaceClient.getJsonRpcApi(jsonRpcApiLocation);
    // connect
    if (this.token) {
      jsonRpcApiLocation += `?token=${this.token}`;
    }
    await this._jsonRpcMasterApi.connect(jsonRpcApiLocation);
    const clientId = this._jsonRpcMasterApi.getClientId();
    console.log('WebSocket connection clientId', clientId);
  }
}
