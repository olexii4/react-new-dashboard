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

import { Store } from 'redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { AppState } from '../../store';
import { WorkspaceStatus } from '../workspaceStatus';

export const createFakeStore = (workspaceId: string, workspaceName: string, runtime?: che.WorkspaceRuntime): Store => {
  const middleware = [thunk];
  const mockStore = createMockStore(middleware);
  return mockStore({
    workspaces: {
      isLoading: false,
      settings: {} as any,
      workspaces: [
        {
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
        },
      ],
      workspacesLogs: new Map(),
      namespace: '',
      workspaceName: '',
      workspaceId: '',
      recentNumber: '',
    } as any,
    factoryResolver: {} as any,
    plugins: {} as any,
    branding: {} as any,
    devfileRegistries: {} as any,
    user: {} as any,
    infrastructureNamespace: {} as any,
  } as AppState);
};
