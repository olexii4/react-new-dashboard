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
import { createHashHistory } from 'history';
import { render, screen } from '@testing-library/react';
import { GetStartedPage } from '../GetStartedPage';
import { BrandingData } from '../../../../services/bootstrap/branding.constant';

jest.mock('../get-started-tab/SamplesListTab', () => {
  return function DummyTab(): React.ReactElement {
    return <span>Samples List Tab Content</span>;
  };
});
jest.mock('../custom-workspace-tab/CustomWorkspaceTab', () => {
  return function DummyTab(): React.ReactNode {
    return <span>Custom Workspace Tab Content</span>;
  };
});

describe('Get Started page', () => {

  let masthead: HTMLElement;

  beforeEach(() => {
    const history = createHashHistory();
    const branding = {
      isLoading: false,
      data: {
        name: 'test'
      } as BrandingData
    };
    render(<GetStartedPage branding={branding} history={history} />);

    masthead = screen.getByRole('heading');
  });

  it('should have correct masthead when Get Started tab is active', () => {
    const getStartedTabButton = screen.getByRole('button', { name: 'Get Started' });
    getStartedTabButton.click();

    expect(masthead.textContent?.startsWith('Getting Started with'));
  });

  it('should have correct masthead when Custom Workspace tab is active', () => {
    const customWorkspaceTabButton = screen.getByRole('button', { name: 'Custom Workspace' });
    customWorkspaceTabButton.click();

    expect(masthead.textContent?.startsWith('Create Custom Workspace'));
  });

});
