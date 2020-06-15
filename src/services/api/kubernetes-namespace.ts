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

const API_KUBERNETES = '/api/kubernetes/namespace';

export async function fetchKubernetesNamespace(): Promise<Array<che.KubernetesNamespace>> {
  try {
    const response = await Axios.get(API_KUBERNETES);
    return response.data;
  } catch (e) {
    throw new Error('Failed to fetch kubernetes namespaces list' + e);
  }
}
