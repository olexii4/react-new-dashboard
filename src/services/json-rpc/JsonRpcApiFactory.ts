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
