import { CheJsonRpcApiClient } from './JsonRpcApiService';
import { CommunicationClient, CommunicationClientEvent } from './JsonRpcClient';
import { Keycloak } from '../keycloak/Keycloak';
import { container } from '../../inversify.config';
import { WebsocketClient } from "./WebsocketClient";

export enum MasterChannels {
  ENVIRONMENT_OUTPUT = 'runtime/log',
  ENVIRONMENT_STATUS = 'machine/statusChanged',
  WORKSPACE_STATUS = 'workspace/statusChanged'
}
const SUBSCRIBE = 'subscribe';
const UNSUBSCRIBE = 'unsubscribe';

/**
 * Client API for workspace master interactions.
 */
export class JsonRpcMasterApi {
  private readonly keycloak: Keycloak;
  private client: CommunicationClient;
  private cheJsonRpcApi: CheJsonRpcApiClient;
  private clientId: string;

  constructor(
    private readonly entryPoint: string,
  ) {
    this.keycloak = container.get(Keycloak);
    this.client = container.get(WebsocketClient);
    this.cheJsonRpcApi = new CheJsonRpcApiClient(this.client);
    this.connect();
  }

  addListener(eventType: CommunicationClientEvent, handler: Function): void {
    this.client.addListener(eventType, handler);
  }

  removeListener(eventType: CommunicationClientEvent, handler: Function): void {
    this.client.removeListener(eventType, handler);
  }

  /**
   * Opens connection to pointed entryPoint.
   * @returns {Promise<void>}
   */
  async connect(): Promise<void> {
    const entryPointProvider = async (): Promise<string> => {
      const entryPoint = this.entryPoint + (await this.getAuthenticationToken());
      if (this.clientId) {
        let clientId = `clientId=${this.clientId}`;
        if (/\?/.test(entryPoint) === false) {
          clientId = '?' + clientId;
        } else {
          clientId = '&' + clientId;
        }
        return entryPoint + clientId;
      }
      return entryPoint;
    };

    await this.cheJsonRpcApi.connect(entryPointProvider);
    return await this.fetchClientId();
  }

  private async getAuthenticationToken(): Promise<string> {
    if (!this.keycloak) {
      return Promise.resolve('');
    }
    return new Promise(resolve => {
      this.keycloak.updateToken(5).then(() => {
        resolve('?token=' + (window as any)._keycloak.token);
      }).catch(() => {
        resolve('');
      });
    });
  }

  /**
   * Subscribes the environment output.
   * @param workspaceId workspace's id
   * @param callback callback to process event
   */
  subscribeEnvironmentOutput(workspaceId: string, callback: Function): void {
    this.subscribe(MasterChannels.ENVIRONMENT_OUTPUT, workspaceId, callback);
  }

  /**
   * Un-subscribes the pointed callback from the environment output.
   * @param workspaceId workspace's id
   * @param callback callback to process event
   */
  unSubscribeEnvironmentOutput(workspaceId: string, callback: Function): void {
    this.unsubscribe(MasterChannels.ENVIRONMENT_OUTPUT, workspaceId, callback);
  }

  /**
   * Subscribes the environment status changed.
   * @param workspaceId workspace's id
   * @param callback callback to process event
   */
  subscribeEnvironmentStatus(workspaceId: string, callback: Function): void {
    this.subscribe(MasterChannels.ENVIRONMENT_STATUS, workspaceId, callback);
  }

  /**
   * Un-subscribes the pointed callback from environment status changed.
   * @param workspaceId workspace's id
   * @param callback callback to process event
   */
  unSubscribeEnvironmentStatus(workspaceId: string, callback: Function): void {
    this.unsubscribe(MasterChannels.ENVIRONMENT_STATUS, workspaceId, callback);
  }

  /**
   * Subscribes to workspace's status.
   * @param workspaceId workspace's id
   * @param callback callback to process event
   */
  subscribeWorkspaceStatus(workspaceId: string, callback: Function): void {
    const statusHandler = (message: any): void => {
      if (workspaceId === message.workspaceId) {
        callback(message);
      }
    };
    this.subscribe(MasterChannels.WORKSPACE_STATUS, workspaceId, statusHandler);
  }

  /**
   * Un-subscribes pointed callback from workspace's status.
   * @param workspaceId
   * @param callback
   */
  unSubscribeWorkspaceStatus(workspaceId: string, callback: Function): void {
    this.unsubscribe(MasterChannels.WORKSPACE_STATUS, workspaceId, callback);
  }

  /**
   * Un-subscribes all pointed callback from workspace's status.
   */
  unSubscribeAllWorkspaceStatus(): void {
    this.unsubscribeAll(MasterChannels.WORKSPACE_STATUS);
  }

  /**
   * Fetch client's id and stores it.
   * @returns {Promise<void>}
   */
  async fetchClientId(): Promise<void> {
    const data = await this.cheJsonRpcApi.request('websocketIdService/getId');
    this.clientId = data[0];
  }

  /**
   * Returns client's id.
   * @returns {string} client connection identifier
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Performs subscribe to the pointed channel for pointed workspace's ID and callback.
   * @param channel channel to un-subscribe
   * @param workspaceId workspace's id
   * @param callback callback
   */
  private subscribe(channel: MasterChannels, workspaceId: string, callback: Function): void {
    const method: string = channel.toString();
    const params = { method: method, scope: { workspaceId: workspaceId } };
    this.cheJsonRpcApi.subscribe(SUBSCRIBE, method, callback, params);
  }

  /**
   * Performs un-subscribe of the pointed channel by pointed workspace's ID and callback.
   * @param channel channel to un-subscribe
   * @param workspaceId workspace's id
   * @param callback callback
   */
  private unsubscribe(channel: MasterChannels, workspaceId: string, callback: Function): void {
    const method: string = channel.toString();
    this.cheJsonRpcApi.unsubscribe(UNSUBSCRIBE, method, callback);
  }

  /**
   * Performs unsubscribe all pointed channels by pointed the channel to unsubscribe.
   * @param channel channel to un-subscribe
   */
  private unsubscribeAll(channel: MasterChannels): void {
    const method: string = channel.toString();
    this.cheJsonRpcApi.unsubscribeAll(UNSUBSCRIBE, method);
  }
}
