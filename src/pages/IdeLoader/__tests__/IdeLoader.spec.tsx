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
import renderer, { ReactTestRenderer } from 'react-test-renderer';
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
    const currentStep = LoadIdeSteps.INITIALIZING;
    const hasError = false;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('INITIALIZING step with an error renders correctly', () => {
    const currentStep = LoadIdeSteps.INITIALIZING;
    const hasError = true;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('START_WORKSPACE step renders correctly', () => {
    const currentStep = LoadIdeSteps.START_WORKSPACE;
    const hasError = false;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('START_WORKSPACE step with an error renders correctly', () => {
    const currentStep = LoadIdeSteps.START_WORKSPACE;
    const hasError = true;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('OPEN_IDE step renders correctly', () => {
    const currentStep = LoadIdeSteps.OPEN_IDE;
    const hasError = false;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('OPEN_IDE step with an error renders correctly', () => {
    const currentStep = LoadIdeSteps.OPEN_IDE;
    const hasError = true;
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('Open IDE in the iframe renders correctly', () => {
    const currentStep = LoadIdeSteps.OPEN_IDE;
    const hasError = false;
    const ideUrl = 'https://server-test-4400.192.168.99.100.nip.io';
    const component = renderComponent(store, currentStep, workspaceName, workspaceId, hasError, ideUrl);

    expect(component.toJSON()).toMatchSnapshot();
  });

});

function renderComponent(
  store: Store,
  currentStep: LoadIdeSteps,
  workspaceName: string,
  workspaceId: string,
  hasError: boolean,
  ideUrl?: string,
): ReactTestRenderer {
  return renderer.create(
    <Provider store={store}>
      <IdeLoaderTabs
        currentStep={currentStep}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        hasError={hasError}
        ideUrl={ideUrl}
      />
    </Provider>,
  );
}

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
