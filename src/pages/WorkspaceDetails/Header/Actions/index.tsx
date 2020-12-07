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

import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import React from 'react';
import WorkspaceDeleteAction from '../../../../components/Workspace/DeleteAction';
import { Actions } from '../../../../containers/WorkspaceDetails';
import { WorkspaceStatus } from '../../../../services/helpers/types';

import './Actions.styl';

type Props = {
  workspaceId: string;
  status: string | undefined;
  onAction: (action: Actions) => void;
};

type State = {
  isExpanded: boolean;
}

export class HeaderActionSelect extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isExpanded: false,
    };
  }

  private handleToggle(isExpanded: boolean): void {
    this.setState({ isExpanded });
  }

  private handleSelect(selected: Actions): void {
    this.setState({
      isExpanded: false,
    });
    this.props.onAction(selected);
  }

  private getDropdownItems(): React.ReactNode[] {
    const { workspaceId, status } = this.props;

    return [
      (<DropdownItem
        key={`action-${Actions.OPEN}`}
        onClick={() => this.handleSelect(Actions.OPEN)}>
        <div>{Actions.OPEN}</div>
      </DropdownItem>),
      (<DropdownItem
        key={`action-${Actions.OPEN_IN_VERBOSE_MODE}`}
        onClick={() => this.handleSelect(Actions.OPEN_IN_VERBOSE_MODE)}>
        <div>{Actions.OPEN_IN_VERBOSE_MODE}</div>
      </DropdownItem>),
      (<DropdownItem
        key={`action-${Actions.START_IN_BACKGROUND}`}
        isDisabled={status !== WorkspaceStatus[WorkspaceStatus.STOPPED]}
        onClick={() => this.handleSelect(Actions.START_IN_BACKGROUND)}>
        <div>{Actions.START_IN_BACKGROUND}</div>
      </DropdownItem>),
      (<DropdownItem
        key={`action-${Actions.STOP_WORKSPACE}`}
        isDisabled={status === WorkspaceStatus[WorkspaceStatus.STOPPED]}
        onClick={() => this.handleSelect(Actions.STOP_WORKSPACE)}>
        <div>{Actions.STOP_WORKSPACE}</div>
      </DropdownItem>),
      (<DropdownItem
        key={`action-${Actions.DELETE_WORKSPACE}`}
        isDisabled={status === WorkspaceStatus[WorkspaceStatus.STARTING] || status === WorkspaceStatus[WorkspaceStatus.STOPPING]}
        onClick={() => this.handleSelect(Actions.DELETE_WORKSPACE)}>
        <WorkspaceDeleteAction
          workspaceId={workspaceId}
          status={status ? WorkspaceStatus[status] : WorkspaceStatus.STOPPED}>
          {Actions.DELETE_WORKSPACE}
        </WorkspaceDeleteAction>
      </DropdownItem>),
    ];
  }

  render(): React.ReactNode {
    const { isExpanded } = this.state;

    return (
      <Dropdown
        className="workspace-action-selector"
        toggle={(
          <DropdownToggle onToggle={isExpanded => this.handleToggle(isExpanded)} toggleIndicator={CaretDownIcon}
            isPrimary>
            Actions
          </DropdownToggle>
        )}
        isOpen={isExpanded}
        position="right"
        dropdownItems={this.getDropdownItems()}
      />
    );
  }
}
