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

import { AlertVariant } from '@patternfly/react-core';
import React from 'react';
import { Provider } from 'react-redux';
import { RenderResult, render, screen } from '@testing-library/react';
import { ROUTE } from '../../route.enum';
import { getMockRouterProps } from '../../services/__mocks__/router';
import { createFakeStore } from '../../services/__mocks__/store';
import { WorkspaceStatus } from '../../services/workspaceStatus';
import IdeLoader, { LoadIdeSteps } from '../IdeLoader';
import * as StoreWorkspaces from '../../store/Workspaces/index';

jest.mock('../../store/Workspaces/index', () => {
  return () => StoreWorkspaces;
});

const showAlert = jest.fn();

jest.mock('../../pages/IdeLoader', () => {
  return function DummyWizard(props: {
    hasError: boolean,
    currentStep: LoadIdeSteps,
    workspaceName: string;
    workspaceId: string;
    ideUrl?: string;
    callbacks?: {
      showAlert?: (variant: AlertVariant, title: string) => void
    }
  }): React.ReactElement {
    if (props.callbacks) {
      props.callbacks.showAlert = showAlert;
    }
    return (<div>Dummy Wizard
      <div data-testid="ide-loader-has-error">{props.hasError.toString()}</div>
      <div data-testid="ide-loader-current-step">{props.currentStep}</div>
      <div data-testid="ide-loader-workspace-name">{props.workspaceName}</div>
      <div data-testid="ide-loader-workspace-id">{props.workspaceId}</div>
      <div data-testid="ide-loader-workspace-ide-url">{props.ideUrl}</div>
    </div>);
  };
});

describe('IDE Loader container', () => {

  const workspaces = [
    {
      id: 'id-wksp-1',
      status: WorkspaceStatus[WorkspaceStatus.STOPPED],
      devfile: {
        metadata: {
          name: 'name-wksp-1',
        },
      },
      namespace: 'admin1',
    },
    {
      id: 'id-wksp-2',
      status: WorkspaceStatus[WorkspaceStatus.RUNNING],
      devfile: {
        metadata: {
          name: 'name-wksp-2',
        },
      },
      namespace: 'admin2',
      runtime: {
        machines: {
          'theia-ide-test': {
            servers: {
              theia: {
                attributes: {
                  type: 'ide',
                },
                url: 'https://server-test-4402.192.168.99.100.nip.io',
              },
            },
          },
        },
      },
    },
  ] as che.Workspace[];

  const renderComponent = (
    namespace: string,
    workspaceName: string,
    startWorkspace: jest.Mock,
    requestWorkspace: jest.Mock,
  ): RenderResult => {
    const store = createFakeStore(workspaces);
    const { history, location, match } = getMockRouterProps(ROUTE.IDE, { namespace, workspaceName });
    return render(
      <Provider store={store}>
        <IdeLoader match={match}
          history={history}
          location={location}
          startWorkspace={startWorkspace}
          requestWorkspace={requestWorkspace} />
      </Provider>,
    );
  };

  it('should show an error if something wrong', () => {
    const namespace = 'admin3';
    const workspaceName = 'name-wksp-3';

    const requestWorkspace = jest.fn();
    const startWorkspace = jest.fn();

    renderComponent(
      namespace,
      workspaceName,
      startWorkspace,
      requestWorkspace);

    expect(startWorkspace).not.toBeCalled();
    expect(requestWorkspace).not.toBeCalled();
    expect(showAlert).toBeCalledWith('danger', 'Failed to find the target workspace.');

    const elementHasError = screen.getByTestId('ide-loader-has-error');
    expect(elementHasError.innerHTML).toEqual('true');

    const elementCurrentStep = screen.getByTestId('ide-loader-current-step');
    expect(LoadIdeSteps[elementCurrentStep.innerHTML]).toEqual(LoadIdeSteps[LoadIdeSteps.INITIALIZING]);
  });

  it('should have correct WORKSPACE START and waiting for the workspace runtime', () => {
    const namespace = 'admin1';
    const workspaceId = 'id-wksp-1';
    const workspaceName = 'name-wksp-1';

    const requestWorkspace = jest.fn();
    const startWorkspace = jest.fn();

    renderComponent(
      namespace,
      workspaceName,
      startWorkspace,
      requestWorkspace);

    expect(startWorkspace).toHaveBeenCalledTimes(1);
    expect(requestWorkspace).not.toBeCalled();

    const elementHasError = screen.getByTestId('ide-loader-has-error');
    expect(elementHasError.innerHTML).toEqual('false');

    const elementWorkspaceId = screen.getByTestId('ide-loader-workspace-id');
    expect(elementWorkspaceId.innerHTML).toEqual(workspaceId);

    const elementWorkspaceName = screen.getByTestId('ide-loader-workspace-name');
    expect(elementWorkspaceName.innerHTML).toEqual(workspaceName);

    const elementCurrentStep = screen.getByTestId('ide-loader-current-step');
    expect(LoadIdeSteps[elementCurrentStep.innerHTML]).toEqual(LoadIdeSteps[LoadIdeSteps.START_WORKSPACE]);

    const elementIdeUrl = screen.getByTestId('ide-loader-workspace-ide-url');
    expect(elementIdeUrl.innerHTML).toEqual('');
  });

  it('should have correct OPEN_IDE', () => {
    const ideUrl = 'https://server-test-4402.192.168.99.100.nip.io';
    const namespace = 'admin2';
    const workspaceName = 'name-wksp-2';

    const requestWorkspace = jest.fn();
    const startWorkspace = jest.fn();

    renderComponent(
      namespace,
      workspaceName,
      startWorkspace,
      requestWorkspace);

    expect(startWorkspace).not.toBeCalled();
    expect(requestWorkspace).not.toBeCalled();

    const elementHasError = screen.getByTestId('ide-loader-has-error');
    expect(elementHasError.innerHTML).toEqual('false');

    const elementWorkspaceName = screen.getByTestId('ide-loader-workspace-name');
    expect(elementWorkspaceName.innerHTML).toEqual(workspaceName);

    const elementCurrentStep = screen.getByTestId('ide-loader-current-step');
    expect(LoadIdeSteps[elementCurrentStep.innerHTML]).toEqual(LoadIdeSteps[LoadIdeSteps.OPEN_IDE]);

    const elementWorkspaceId = screen.getByTestId('ide-loader-workspace-id');
    expect(elementWorkspaceId.innerHTML).toEqual('');

    const elementIdeUrl = screen.getByTestId('ide-loader-workspace-ide-url');
    expect(elementIdeUrl.innerHTML).toEqual(ideUrl);
  });

});
