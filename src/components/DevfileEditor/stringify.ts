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

import { safeDump } from 'js-yaml';

const sortOrder: Array<keyof che.WorkspaceDevfile> = ['apiVersion', 'metadata', 'attributes', 'projects', 'components', 'commands'];

const lineWidth = 9999;

function sortKeys(key1: keyof che.WorkspaceDevfile, key2: keyof che.WorkspaceDevfile): -1 | 0 | 1 {
  const index1 = sortOrder.indexOf(key1);
  const index2 = sortOrder.indexOf(key2);
  if (index1 === -1 && index2 === -1) {
    return 0;
  }
  if (index1 === -1) {
    return 1;
  }
  if (index2 === -1) {
    return -1;
  }
  if (index1 < index2) {
    return -1;
  }
  if (index1 > index2) {
    return 1;
  }
  return 0;
}

/**
 * Provides a devfile stringify function.
 */
export default function stringify(devfile: che.WorkspaceDevfile | undefined): string {
  if (!devfile) {
    return '';
  }
  return safeDump(devfile as che.WorkspaceDevfile, { lineWidth, sortKeys });
}
