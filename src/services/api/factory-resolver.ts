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

export async function fetchFactoryResolver(url: string, headers?: { [name: string]: string | undefined; }): Promise<che.WorkspaceDevfile> {
  try {
    const response = await Axios({
      'method': 'POST',
      'url': '/api/factory/resolver/',
      'headers': headers ? headers : { 'Authorization': undefined },
      'data': { url }
    });
    if (!response || !response.data || !response.data.devfile) {
      return Promise.reject({
        data: {
          message: 'The specified link does not contain a valid Devfile.'
        }
      });
    }
    if (response.data.source === 'repo') {
      return Promise.reject({
        data: {
          message: 'devfile.yaml not found in the specified GitHub repository root.'
        }
      });
    }

    return response.data.devfile;
  } catch (e) {
    throw new Error('Failed to fetch factory resolver, ' + e);
  }
}
