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
import { WorkspaceStatus } from '../../../services/api/workspaceStatus';

import './Indicator.styl';

type Props = {
  status: string;
};

class WorkspaceIndicator extends React.PureComponent<Props> {

  public render(): React.ReactElement {

    if (WorkspaceStatus[this.props.status] === WorkspaceStatus.STARTING || WorkspaceStatus[this.props.status] === WorkspaceStatus.STOPPING) {
      return (
        <span className='workspace-status-indicator'>
          <span className='workspace-status-spinner ng-scope'>
            <div className='spinner'>
              <div className='rect1' /><div className='rect2' /><div className='rect3' />
            </div>
          </span>
        </span>
      );
    }

    const iconClass = (status: string): string => {
      if (WorkspaceStatus[status] === WorkspaceStatus.ERROR) {
        return 'codicon codicon-circle-filled workspace-status-error';
      }
      if (WorkspaceStatus[status] === WorkspaceStatus.RUNNING) {
        return 'codicon codicon-circle-filled';
      }
      return 'codicon codicon-circle-outline';
    };

    return (
      <span className='workspace-status-indicator'>
        <i className={iconClass(this.props.status)} />
      </span>
    );
  }
}

export default WorkspaceIndicator;
