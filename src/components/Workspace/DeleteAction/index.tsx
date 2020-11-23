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
import { connect, ConnectedProps } from 'react-redux';
import { Tooltip } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { container } from '../../../inversify.config';
import { Debounce } from '../../../services/debounce/Debounce';
import * as WorkspaceStore from '../../../store/Workspaces';

import * as styles from '../action.module.css';

type Props = MappedProps
  & {
    workspaceId: string;
    disabled: boolean;
  };

type State = {
  isDebounceDelay: boolean;
};

class WorkspaceDeleteAction extends React.PureComponent<Props, State> {
  private debounce: Debounce;

  constructor(props: Props) {
    super(props);

    this.state = {
      isDebounceDelay: false,
    };

    this.debounce = container.get(Debounce);
    this.debounce.subscribe(isDebounceDelay => {
      this.setState({ isDebounceDelay });
    });
  }

  // This method is called when the component is removed from the document
  componentWillUnmount(): void {
    this.debounce.unsubscribeAll();
  }

  private onClick(event: React.MouseEvent): void {
    event.stopPropagation();

    if (this.props.disabled || this.state.isDebounceDelay) {
      return;
    }

    this.debounce.setDelay();
    this.props.deleteWorkspace(this.props.workspaceId);
  }

  public render(): React.ReactElement {
    const tooltipContent = 'Delete Workspace';
    const { workspaceId, disabled } = this.props;
    const { isDebounceDelay } = this.state;
    const className = disabled || isDebounceDelay ? styles.disabledWorkspaceStatus : styles.workspaceStatus;

    return (
      <span
        data-testid={`delete-${workspaceId}`}
        key={`wrks-delete-${workspaceId}`}
        className={className}
        onClick={e => this.onClick(e)}
      >
        <Tooltip
          entryDelay={200}
          exitDelay={200}
          content={tooltipContent}
        >
          <TrashIcon />
        </Tooltip>
      </span>
    );
  }

}

const mapStateToProps = () => ({});

const connector = connect(
  mapStateToProps,
  WorkspaceStore.actionCreators,
);

type MappedProps = ConnectedProps<typeof connector> | any;
export default connector(WorkspaceDeleteAction);
