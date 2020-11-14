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
import renderer from 'react-test-renderer';
import WorkspaceStatusLabel from '../';
import { WorkspaceStatus } from '../../../services/workspaceStatus';

describe('The workspace status label component', () => {

  it('Default status renders correctly', () => {
    const element = (<WorkspaceStatusLabel
      status={undefined}
    />);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('Status STOPPED renders correctly', () => {
    const element = (<WorkspaceStatusLabel
      status={WorkspaceStatus[WorkspaceStatus.STOPPED]}
    />);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('Status RUNNING renders correctly', () => {
    const element = (<WorkspaceStatusLabel
      status={WorkspaceStatus[WorkspaceStatus.RUNNING]}
    />);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('Status ERROR renders correctly', () => {
    const element = (<WorkspaceStatusLabel
      status={WorkspaceStatus[WorkspaceStatus.ERROR]}
    />);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });

  it('Status PAUSE renders correctly', () => {
    const element = (<WorkspaceStatusLabel
      status={WorkspaceStatus[WorkspaceStatus.PAUSED]}
    />);

    expect(renderer.create(element).toJSON()).toMatchSnapshot();
  });
});
