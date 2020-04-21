import { JsonRpcMasterApi } from './JsonRpcMasterApi';
import { injectable } from 'inversify';

/**
 * This class manages the api connection through JSON RPC.
 */
@injectable()
export class CheJsonRpcApi {
  private jsonRpcApiConnection: Map<string, JsonRpcMasterApi>;

  /**
   * Default constructor that is using resource.
   */
  constructor() {
    this.jsonRpcApiConnection = new Map<string, JsonRpcMasterApi>();
  }

  getJsonRpcMasterApi(entrypoint: string): JsonRpcMasterApi {
    if (this.jsonRpcApiConnection.has(entrypoint)) {
      return this.jsonRpcApiConnection.get(entrypoint) as JsonRpcMasterApi;
    } else {
      const cheJsonRpcMasterApi: JsonRpcMasterApi = new JsonRpcMasterApi(entrypoint);
      this.jsonRpcApiConnection.set(entrypoint, cheJsonRpcMasterApi);
      return cheJsonRpcMasterApi;
    }
  }

}
