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

import { InProgressIconConfig } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import NavigationRecentItem from '../RecentItem';
import { NavigationRecentItemObject } from '..';

describe('Navigation Item', () => {

  let activeItem = '';
  const item: NavigationRecentItemObject = {
    status: '',
    label: 'workspace',
    to: '/namespace/workspace',
  };

  function renderComponent(): RenderResult {
    return render(
      <MemoryRouter>
        <NavigationRecentItem item={item} activePath={activeItem} />
      </MemoryRouter>
    );
  }

  it('should have correct label', () => {
    renderComponent();

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('workspace');
  });

  it('should have workspace status icon', () => {
    renderComponent();
    const link = screen.getByRole('link');
    expect(link.outerHTML).toMatch('<a class="pf-c-nav__link" href="/namespace/workspace">' +
      '<span class="workspace-name"><span><svg style="vertical-align: -0.125em;" fill="#0e6fe0" height="1em"' +
      ' width="1em" viewBox="0 64 1024 1024" aria-hidden="true" role="img">' +
      '<path d="' + InProgressIconConfig.svgPath + '" transform="' + InProgressIconConfig.transform + '"></path>' +
      '</svg></span>workspace</span></a>');
  });

  describe('activation', () => {

    it('should render not active navigation item', () => {
      renderComponent();

      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('should render active navigation item', () => {
      activeItem = '/namespace/workspace';
      renderComponent();

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current');
    });

    it('should activate navigation item on props change', () => {
      activeItem = '';
      const { rerender } = renderComponent();

      activeItem = '/namespace/workspace';
      rerender(
        <MemoryRouter>
          <NavigationRecentItem item={item} activePath={activeItem} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current');
    });

  });

});
