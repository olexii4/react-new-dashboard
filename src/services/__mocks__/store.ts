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

export const createFakeStore = (workspaces: che.Workspace[]): Store => {
  const middleware = [thunk];
  const mockStore = createMockStore(middleware);
  return mockStore({
    factoryResolver: {
      isLoading: false,
      resolver: {},
    },
    plugins: {
      isLoading: false,
      plugins: [],
    },
    workspaces: {
      isLoading: false,
      settings: {} as any,
      workspaces,
      workspacesLogs: new Map<string, string[]>(),

      namespace: '',
      workspaceName: '',
      workspaceId: '',
      recentNumber: 5,
    },
    branding: {} as any,
    devfileRegistries: {} as any,
    user: {} as any,
    infrastructureNamespace: {} as any,
  } as AppState);
};
