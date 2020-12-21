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
import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import { Store } from 'redux';
import HeaderTools from '..';
import { FakeStoreBuilder } from '../../../../store/__mocks__/storeBuilder';

jest.mock('gravatar-url', () => {
  return function () {
    return 'avatar/source/location';
  };
});

describe('Page header tools', () => {
  const mockLogout = jest.fn();
  const mockChangeTheme = jest.fn();
  const mockOnCopyLoginCommand = jest.fn();

  const cheCliTool = 'crwctl';
  const email = 'johndoe@example.com';
  const name = 'John Doe';
  const store = createStore(cheCliTool);

  const component = (
    <Provider store={store}>
      <HeaderTools
        userEmail={email}
        userName={name}
        logout={mockLogout}
        changeTheme={mockChangeTheme}
        onCopyLoginCommand={mockOnCopyLoginCommand}
      />
    </Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly render the component', () => {
    expect(renderer.create(component).toJSON()).toMatchSnapshot();
  });

  it('should open the dropdown', () => {
    render(component);

    const menuButton = screen.getByRole('button', { name });
    fireEvent.click(menuButton);

    const items = screen.getAllByRole('menuitem');
    expect(items.length).toEqual(4);
  });

  it('should send a request', () => {
    render(component);

    const menuButton = screen.getByRole('button', { name });
    fireEvent.click(menuButton);

    const copyLoginCommandButton = screen.getByText(`Copy ${cheCliTool} login command`);
    fireEvent.click(copyLoginCommandButton);

    expect(mockOnCopyLoginCommand).toBeCalled();
  });

  it('should fire the logout event', () => {
    render(component);

    const menuButton = screen.getByRole('button', { name });
    fireEvent.click(menuButton);

    const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutItem);

    expect(mockLogout).toBeCalled();
  });

});

function createStore(cheCliTool: string): Store {
  return new FakeStoreBuilder()
    .withBranding({
      configuration: {
        cheCliTool
      }
    } as any)
    .build();
}
