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
import { Tooltip } from '@patternfly/react-core';
import { Debounce } from '../../../services/debounce/Debounce';
import { container } from '../../../inversify.config';

import './Status.styl';

// TODO should move these constants to the separate file
const STOPPED = 'STOPPED';
const RUNNING = 'RUNNING';

type WorkspaceStatusProps = { workspaceId: string; status: string; startWorkspace: Function; stopWorkspace: Function }; // incoming parameters

class WorkspaceStatus extends React.PureComponent<WorkspaceStatusProps, { isDebounceDelay: boolean }> {
  private debounce: Debounce;

  constructor(props: WorkspaceStatusProps) {
    super(props);

    this.debounce = container.get(Debounce);
    this.debounce.subscribe(isDebounceDelay => {
      this.setState({ isDebounceDelay });
    });
  }

  // This method is called when the component is removed from the document
  componentWillUnmount(): void {
    this.debounce.unsubscribeAll();
  }

  private isDisabled = (): boolean => {
    return this.debounce.hasDelay() || (this.props.status !== STOPPED && this.props.status !== RUNNING);
  };

  public render(): React.ReactElement {
    const tooltipContent = (): string => this.props.status === STOPPED ? 'Run Workspace' : 'Stop workspace';
    const iconClass = (): string => this.props.status === STOPPED ? 'codicon codicon-play' : 'codicon codicon-debug-stop';

    return (
      <span key={`wrks-status-${this.props.workspaceId}`}
        className={this.isDisabled() ? 'disabled-workspace-status' : 'workspace-status'}
        onClick={(e): void => {
          e.stopPropagation();
          this.onActionClick();
        }}>
        <Tooltip entryDelay={200} exitDelay={200}
          content={tooltipContent()}>
          <i className={iconClass()}>&nbsp;</i>
        </Tooltip>
      </span>
    );
  }

  private onActionClick(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.props.status === STOPPED) {
      this.props.startWorkspace(this.props.workspaceId);
    } else if (this.props.status === RUNNING) {
      this.props.stopWorkspace(this.props.workspaceId);
    }
    this.debounce.setDelay();
  }

}

export default WorkspaceStatus;
