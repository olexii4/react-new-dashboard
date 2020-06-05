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

import './workspace-indicator.styl';

// TODO should move this constants to the separate file
const ERROR = 'ERROR';
const STARTING = 'STARTING';
const RUNNING = 'RUNNING';
const STOPPING = 'STOPPING';

class WorkspaceIndicator extends React.PureComponent<{ status: string | undefined }> {

  public render(): React.ReactElement {

    if (this.props.status === STARTING || this.props.status === STOPPING) {
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

    const iconClass = (status: string | undefined): string => {
      if (status === ERROR) {
        return 'fa fa-circle workspace-status-error';
      }
      if (status === RUNNING) {
        return 'fa fa-circle';
      }
      return 'fa fa-circle-o';
    };

    return (
      <React.Fragment>
        <span className='workspace-status-indicator'><i className={iconClass(this.props.status)} /></span>
      </React.Fragment>
    );
  }
}

export default WorkspaceIndicator;
