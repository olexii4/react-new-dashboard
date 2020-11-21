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

import React from 'react';
import { Provider } from 'react-redux';
import renderer, { ReactTestRenderer } from 'react-test-renderer';
import { Store } from 'redux';
import LogsTab from '../';
import { createFakeStore } from '../../../services/__mocks__/store';
import { createFakeWorkspace, createFakeWorkspaceLogs } from '../../../services/__mocks__/workspace';
import { WorkspaceStatus } from '../../../services/workspaceStatus';

jest.mock('../../../services/tools/helper', () => {
  return {
    getBlobUrl: () => 'https://fake.blob.url'
  };
});

describe('The LogsTab component', () => {
  const namespace = 'admin';
  const workspaceId = 'workspace-test-id';
  const workspaceName = 'workspace-test-name';
  const runtime: che.WorkspaceRuntime = {
    machines: {},
    status: WorkspaceStatus[WorkspaceStatus.RUNNING],
    activeEnv: 'default',
  };

  it('should render empty state widget correctly', () => {
    const workspace = createFakeWorkspace(workspaceId, workspaceName);
    const store = createFakeStore([workspace]);

    const component = renderComponent(store, workspaceId);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render workspace-logs widget without logs correctly', () => {
    const workspace = createFakeWorkspace(workspaceId, workspaceName, namespace, runtime);

    const store = createFakeStore([workspace]);

    const component = renderComponent(store, workspaceId);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render workspace-logs widget with logs inside correctly', () => {
    const workspace = createFakeWorkspace(workspaceId, workspaceName, namespace, runtime);
    const workspacesLogs = createFakeWorkspaceLogs(workspaceId, [
      'Pulling image "quay.io/eclipse/che-theia-endpoint-runtime-binary:next"',
      'Successfully pulled image "quay.io/eclipse/che-theia-endpoint-runtime-binary:next"',
      'Created container remote-runtime-injectorvpj',
      'Started container remote-runtime-injectorvpj',
    ]);
    const store = createFakeStore([workspace], workspacesLogs);

    const component = renderComponent(store, workspaceId);

    expect(component.toJSON()).toMatchSnapshot();
  });
});

function renderComponent(
  store: Store,
  workspaceId: string,
): ReactTestRenderer {
  return renderer.create(
    <Provider store={store}>
      <LogsTab
        workspaceId={workspaceId}
      />
    </Provider>,
  );
}
