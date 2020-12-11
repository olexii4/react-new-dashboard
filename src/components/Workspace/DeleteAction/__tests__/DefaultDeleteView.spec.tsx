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
import { render, RenderResult, screen } from '@testing-library/react';
import { WorkspaceDeleteAction } from '../';
import { WorkspaceStatus } from '../../../../services/helpers/types';
import { createFakeStore } from '../../../../store/__mocks__/store';
import getDefaultDeleteView from '../defaultDeleteView';

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

describe('Default Delete View', () => {
  const workspaceId = 'workspace-test-id';

  it('should render DefaultDeleteView widget correctly', () => {
    const className = 'testClassName';
    const component = getDefaultDeleteView(className);

    expect(getComponentSnapshot(component)).toMatchSnapshot();
  });

});

function getComponentSnapshot(
  component: React.ReactElement
): null | ReactTestRendererJSON | ReactTestRendererJSON[] {
  return renderer.create(component).toJSON();
}
