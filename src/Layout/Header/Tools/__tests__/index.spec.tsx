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
import { Action, Store } from 'redux';
import HeaderTools from '..';
import { AppThunk } from '../../../../store';
import { FakeStoreBuilder } from '../../../../store/__mocks__/storeBuilder';
import { BrandingData } from '../../../../services/bootstrap/branding.constant';
import * as InfrastructureNamespaceStore from '../../../../store/InfrastructureNamespace';

jest.mock('gravatar-url', () => {
  return function () {
    return 'avatar/source/location';
  };
});

jest.mock('../../../../store/InfrastructureNamespace', () => {
  return {
    actionCreators: {
      requestNamespaces: (): AppThunk<Action, Promise<void>> => async (dispatch): Promise<void> => {
        return Promise.resolve();
      }
    } as InfrastructureNamespaceStore.ActionCreators,
  };
});

describe('Page header tools', () => {
  const mockLogout = jest.fn();
  const mockChangeTheme = jest.fn();
  const mockOnCopyLoginCommand = jest.fn();
  global.open = jest.fn();

  const cheCliTool = 'crwctl';
  const email = 'johndoe@example.com';
  const name = 'John Doe';
  const store = createStore(cheCliTool);
  const user = {
    id: 'test-id',
    name: name,
    email: email,
    links: [],
  };

  const component = (
    <Provider store={store}>
      <HeaderTools
        user={user}
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
    expect(items.length).toEqual(2);
  });

  it('should fire the logout event', () => {
    render(component);

    const menuButton = screen.getByRole('button', { name });
    fireEvent.click(menuButton);

    const logoutItem = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutItem);

    expect(mockLogout).toBeCalled();
  });

  it('should send a request', () => {
    render(component);

    const menuButton = screen.getByRole('button', { name });
    fireEvent.click(menuButton);

    const copyLoginCommandButton = screen.getByText(`Copy ${cheCliTool} login command`);
    fireEvent.click(copyLoginCommandButton);

    expect(mockOnCopyLoginCommand).toBeCalled();
  });

  it('should open the info button', () => {
    render(component);

    const infoButton = screen.getByRole('button', { name: 'info button' });
    fireEvent.click(infoButton);

    const items = screen.getAllByRole('menuitem');
    expect(items.length).toEqual(4);
  });

  it('should fire the make a wish event', () => {
    render(component);

    const infoButton = screen.getByRole('button', { name: 'info button' });
    fireEvent.click(infoButton);

    const makeAWishItem = screen.getByRole('menuitem', { name: /Make a wish/i });
    fireEvent.click(makeAWishItem);

    expect(global.open).toBeCalled();
  });

  it('should fire the documentation event', () => {
    render(component);

    const infoButton = screen.getByRole('button', { name: 'info button' });
    fireEvent.click(infoButton);

    const documentationItem = screen.getByRole('menuitem', { name: /Documentation/i });
    fireEvent.click(documentationItem);

    expect(global.open).toBeCalled();
  });

  it('should fire the community event', () => {
    render(component);

    const infoButton = screen.getByRole('button', { name: 'info button' });
    fireEvent.click(infoButton);

    const communityItem = screen.getByRole('menuitem', { name: /Community/i });
    fireEvent.click(communityItem);

    expect(global.open).toBeCalled();
  });

  it('should fire the about dropdown event', () => {
    render(component);

    const infoButton = screen.getByRole('button', { name: 'info button' });
    fireEvent.click(infoButton);

    const aboutItem = screen.getByRole('menuitem', { name: /About/i });
    fireEvent.click(aboutItem);

    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toBeNull();
  });

});

function createStore(cheCliTool: string): Store {
  return new FakeStoreBuilder()
    .withBranding({
      configuration: {
        cheCliTool
      },
      docs: {
      }
    } as BrandingData)
    .build();
}
