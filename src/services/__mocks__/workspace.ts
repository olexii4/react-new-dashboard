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

import { WorkspaceStatus } from '../workspaceStatus';

export const createFakeWorkspace = (
  workspaceId: string,
  workspaceName: string,
  runtime?: che.WorkspaceRuntime,
): che.Workspace => {
  return {
    id: workspaceId,
    attributes: {
      infrastructureNamespace: 'che',
    },
    status: WorkspaceStatus[WorkspaceStatus.STOPPED],
    devfile: {
      apiVersion: '1.0.0',
      metadata: {
        name: workspaceName,
      },
    },
    runtime: runtime,
  } as che.Workspace;
};
