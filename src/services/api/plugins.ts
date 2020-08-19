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

export async function fetchPlugins(registryUrl: string, headers: { [name: string]: string | undefined; } = { 'Authorization': undefined }): Promise<any> {
  try {
    const response = await Axios({
      'method': 'GET',
      'url': `${registryUrl}/plugins/`,
      'headers': headers
    });
    return response.data;
  } catch (e) {
    throw new Error('Failed to fetch workspace settings, ' + e);
  }
}
