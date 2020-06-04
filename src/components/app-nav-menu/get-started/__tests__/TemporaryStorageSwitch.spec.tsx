import React from 'react';
import { RenderResult, render, screen } from '@testing-library/react';
import { TemporaryStorageSwitch } from '../TemporaryStorageSwitch';

describe('Temporary Storage Switch', () => {

  let mockOnChange = jest.fn();

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
