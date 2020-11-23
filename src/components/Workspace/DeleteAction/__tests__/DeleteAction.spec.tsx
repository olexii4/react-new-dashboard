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
import renderer, { ReactTestRendererJSON } from 'react-test-renderer';
import { render, screen } from '@testing-library/react';
import { Store } from 'redux';
import WorkspaceDeleteAction from '../';
import { createFakeStore } from '../../../../services/__mocks__/store';
import { createFakeWorkspace } from '../../../../services/__mocks__/workspace';

jest.mock('../../../../store/Workspaces/index', () => {
  return { actionCreators: {} };
});

jest.mock('@patternfly/react-core', () => {
  return {
    Tooltip: function FakeTooltip(props: {
      content: string;
      children: React.ReactElement[];
    }) {
      return (
        <span>DummyTooltip
          <span>{props.content}</span>
          <span>{props.children}</span>
        </span>
      );
    },
  };
});

describe('Workspace delete component', () => {
  const workspaceId = 'workspace-test-id';
  const workspaceName = 'workspace-test-name';
  const workspace = createFakeWorkspace(workspaceId, workspaceName);
  const store = createFakeStore([workspace]);

  it('should render delete widget enabled correctly', () => {
    const disabled = false;
    const component = createComponent(store, disabled, workspaceId, jest.fn());

    expect(getComponentSnapshot(component)).toMatchSnapshot();
  });

  it('should render delete widget disabled correctly', () => {
    const disabled = false;
    const component = createComponent(store, disabled, workspaceId, jest.fn());

    expect(getComponentSnapshot(component)).toMatchSnapshot();
  });

  it('should delete workspace if enable', () => {
    const disabled = false;
    const deleteWorkspace = jest.fn();

    renderComponent(createComponent(store, disabled, workspaceId, deleteWorkspace));

    expect(deleteWorkspace).not.toBeCalled();

    const getStartedTabButton = screen.getByTestId(`delete-${workspaceId}`);
    getStartedTabButton.click();

    expect(deleteWorkspace).toBeCalledWith(workspaceId);
  });

  it('shouldn\'t delete workspace if disabled', () => {
    const disabled = true;
    const deleteWorkspace = jest.fn();

    renderComponent(createComponent(store, disabled, workspaceId, deleteWorkspace));

    expect(deleteWorkspace).not.toBeCalled();

    const getStartedTabButton = screen.getByTestId(`delete-${workspaceId}`);
    getStartedTabButton.click();

    expect(deleteWorkspace).not.toBeCalled();
  });

});

function createComponent(
  store: Store,
  disabled: boolean,
  workspaceId: string,
  deleteWorkspace: jest.Mock,
): React.ReactElement {
  return (
    <Provider store={store}>
      <WorkspaceDeleteAction
        disabled={disabled}
        workspaceId={workspaceId}
        deleteWorkspace={deleteWorkspace}
      />
    </Provider>
  );
}

function renderComponent(
  component: React.ReactElement
): void {
  render(component);
}

function getComponentSnapshot(
  component: React.ReactElement
): null | ReactTestRendererJSON | ReactTestRendererJSON[] {
  return renderer.create(component).toJSON();
}
