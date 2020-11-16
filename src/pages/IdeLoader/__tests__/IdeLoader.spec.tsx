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
import renderer from 'react-test-renderer';
import { Store } from 'redux';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import IdeLoaderTabs from '../';
import { LoadIdeSteps } from '../../../containers/IdeLoader';
import { AppState } from '../../../store';
import { WorkspaceStatus } from '../../../services/workspaceStatus';

const workspaceName = 'wksp-test';
const workspaceId = 'testWorkspaceId';
const store = createFakeStore(workspaceId, workspaceName);

describe('The Ide Loader page  component', () => {

  it('INITIALIZING step renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.INITIALIZING}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={false}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('INITIALIZING step with an error renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.INITIALIZING}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={true}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('START_WORKSPACE step renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.START_WORKSPACE}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={false}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('START_WORKSPACE step with an error renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.START_WORKSPACE}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={true}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('OPEN_IDE step renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.OPEN_IDE}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={false}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('OPEN_IDE step with an error renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        currentStep={LoadIdeSteps.OPEN_IDE}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={true}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('Open IDE in the iframe renders correctly', () => {
    const element = (<Provider store={store}>
      <IdeLoaderTabs
        ideUrl="https://server-test-4400.192.168.99.100.nip.io"
        currentStep={LoadIdeSteps.OPEN_IDE}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={false}
      />
    </Provider>);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

});

function createFakeStore(workspaceId: string, workspaceName: string): Store {
  const initialState: AppState = {
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
          runtime: undefined,
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
  };
  const middleware = [thunk];
  const mockStore = createMockStore(middleware);
  return mockStore(initialState);
}
