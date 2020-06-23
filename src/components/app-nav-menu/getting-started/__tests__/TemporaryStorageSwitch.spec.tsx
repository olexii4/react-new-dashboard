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
import { RenderResult, render, screen } from '@testing-library/react';
import { TemporaryStorageSwitch } from '../get-started-tab/TemporaryStorageSwitch';

describe('Temporary Storage Switch', () => {

  const mockOnChange = jest.fn();

  function renderSwitch(persistVolumesDefault: 'true' | 'false'): RenderResult {
    return render(
      <TemporaryStorageSwitch
        persistVolumesDefault={persistVolumesDefault}
        onChange={mockOnChange} />
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be initially switched on', () => {
    renderSwitch('false');
    const switchInput = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchInput.checked).toBeTruthy();

    switchInput.click();
    expect(switchInput.checked).toBeFalsy();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should be initially switched off', () => {
    renderSwitch('true');
    const switchInput = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchInput.checked).toBeFalsy();

    switchInput.click();
    expect(switchInput.checked).toBeTruthy();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

});
