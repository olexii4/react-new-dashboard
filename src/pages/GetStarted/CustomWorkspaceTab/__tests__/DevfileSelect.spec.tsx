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
import { RenderResult, render, screen, fireEvent } from '@testing-library/react';
import mockMetadata from '../../../GetStarted/__tests__/devfileMetadata.json';
import { DevfileSelect } from '../DevfileSelect';

describe('Infrastructure Namespace Select', () => {

  const mockOnSelect = jest.fn();

  function renderSelect(): RenderResult {
    return render(
      <DevfileSelect metadata={mockMetadata} onSelect={mockOnSelect} />
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fire "onSelect" event with selected metadata', () => {
    renderSelect();

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeTruthy();
    fireEvent.click(toggleButton);

    const selectOption = screen.getByText('Java Gradle');
    expect(selectOption).toBeTruthy();
    fireEvent.click(selectOption);

    const javaGradleMetadata = mockMetadata.find(meta => meta.displayName === 'Java Gradle');
    expect(mockOnSelect).toHaveBeenCalledWith(javaGradleMetadata);
  });

});
