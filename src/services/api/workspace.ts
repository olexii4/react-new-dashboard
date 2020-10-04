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

import Axios from 'axios';
import * as Qs from 'qs';

const API_WORKSPACE = '/api/workspace';

export async function createWorkspaceFromDevfile(
  devfile: che.WorkspaceDevfile,
  cheNamespace: string | undefined,
  infrastructureNamespace: string | undefined,
  attributes: { [key: string]: string } = {},
): Promise<che.Workspace> {
  const attrs = Object.keys(attributes).map(key => `${key}:${attributes[key]}`);

  try {
    // TODO rework this solution with WorkspaceClient(depends on https://github.com/eclipse/che/issues/17700)
    const response = await Axios({
      method: 'POST',
      url: `${API_WORKSPACE}/devfile`,
      data: devfile,
      params: {
        attribute: attrs,
        namespace: cheNamespace,
        'infrastructure-namespace': infrastructureNamespace,
      },
      paramsSerializer: function (params) {
        return Qs.stringify(params, { arrayFormat: 'repeat' });
      },
    });
    return response.data;
  } catch (e) {
    throw new Error(`Failed to create a workspace from devfile: ${JSON.stringify(devfile)}, ` + e);
  }
}
