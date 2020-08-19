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

import { Provider } from 'react-redux';
import { Store } from 'redux';
import createMockStore from 'redux-mock-store';
import mockAxios from 'axios';
import React from 'react';
import thunk from 'redux-thunk';
import { RenderResult, render, screen, fireEvent } from '@testing-library/react';
import DevfileSelectorFormGroup from '../DevfileSelector';
import { AppState } from '../../../../store';
import mockMetadata from '../../../GetStarted/__tests__/devfileMetadata.json';

describe('Devfile Selector', () => {

  function renderComponent(
    store: Store,
    handleDevfile: (devfile: string) => void = (): void => undefined,
  ): RenderResult {
    return render(
      <Provider store={store}>
        <DevfileSelectorFormGroup
          onDevfile={devfile => handleDevfile(devfile)}
        />
      </Provider>
    );
  }

  let loadButton: HTMLButtonElement;
  let locationTextbox: HTMLInputElement;
  let selectToggleButton: HTMLButtonElement;
  beforeEach(() => {
    const store = createFakeStore(mockMetadata);
    renderComponent(store);
    (mockAxios.get as any).mockResolvedValue({
      data: {},
    });

    loadButton = screen.getByRole('button', { name: 'Load Devfile' }) as HTMLButtonElement;
    locationTextbox = screen.getByRole('textbox', { name: 'URL of devfile' }) as HTMLInputElement;
    selectToggleButton = screen.getByRole('button', { name: 'Select a devfile template Options menu' }) as HTMLButtonElement;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should clear input on selecting a devfile', () => {
    /* enter devfile location into location input */
    fireEvent.change(locationTextbox, { target: { value: 'http://resource/location' } });

    /* select a devfile from the select */
    fireEvent.click(selectToggleButton);

    const option = screen.getByRole('option', { name: 'Java Maven' });
    fireEvent.click(option);

    /* check if location input is clear */
    expect(locationTextbox.value).toEqual('');
    expect(loadButton).toBeDisabled();
  });

  it('should clear select on manually entering the location', () => {
    /* select a devfile */
    fireEvent.click(selectToggleButton);

    const option = screen.getByRole('option', { name: 'Java Maven' });
    fireEvent.click(option);

    /* enter devfile location */
    fireEvent.change(locationTextbox, { target: { value: 'http://resource/location' } });
    fireEvent.click(loadButton);

    /* check if select is clear */
    const selected = screen.queryByText('Java Maven');
    expect(selected).toBeNull();
    const selectPlaceholder = screen.queryByText('Select a devfile template');
    expect(selectPlaceholder).toBeTruthy();
  });

});

function createFakeStore(metadata: che.DevfileMetaData[]): Store {
  const initialState: AppState = {
    plugins: {
      isLoading: false,
      plugins: [],
    },
    workspaces: {} as any,
    branding: {} as any,
    devfileMetadataFilter: {} as any,
    devfileRegistries: {
      devfiles: {},
      isLoading: false,
      metadata,
      schema: {}
    },
    user: {} as any,
    infrastructureNamespace: {} as any,
  };
  const middleware = [thunk];
  const mockStore = createMockStore(middleware);
  return mockStore(initialState);
}
