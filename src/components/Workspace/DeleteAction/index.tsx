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

import { AlertVariant, Tooltip } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { container } from '../../../inversify.config';
import { AppAlerts } from '../../../services/alerts/appAlerts';
import { Debounce } from '../../../services/helpers/debounce';
import { WorkspaceStatus } from '../../../services/helpers/types';
import * as WorkspaceStore from '../../../store/Workspaces';

import * as styles from '../action.module.css';

type Props = MappedProps
  & {
    workspaceId: string;
    disabled?: boolean;
    status: WorkspaceStatus;
    children?: React.ReactNode;
  };

type State = {
  isDebounceDelay: boolean;
  workspaceStatus?: string;
};

export class WorkspaceDeleteAction extends React.PureComponent<Props, State> {
  static shouldDelete: string[] = [];

  private readonly debounce: Debounce;
  private readonly appAlerts: AppAlerts;

  constructor(props: Props) {
    super(props);

    this.state = {
      isDebounceDelay: false,
    };

    this.appAlerts = container.get(AppAlerts);

    this.debounce = container.get(Debounce);
    this.debounce.subscribe(isDebounceDelay => {
      this.setState({ isDebounceDelay });
    });
  }

  private showAlert(message: string, alertVariant?: AlertVariant): void {
    const variant = alertVariant ? alertVariant : AlertVariant.danger;
    this.appAlerts.showAlert({
      key: `wrks-delete-${this.props.workspaceId}-${AlertVariant[variant]}`,
      title: message,
      variant,
    });
  }

  private async checkDelayedActions(): Promise<void> {
    const index = WorkspaceDeleteAction.shouldDelete.indexOf(this.props.workspaceId);
    if (index > -1 && this.props.status === WorkspaceStatus.STOPPED) {
      WorkspaceDeleteAction.shouldDelete.splice(index, 1);
      try {
        await this.props.deleteWorkspace(this.props.workspaceId);
        this.showAlert('Workspace successfully deleted.', AlertVariant.success);
      } catch (e) {
        this.showAlert(`Unable to delete the workspace. ${e}`);
        return;
      }
    }
  }

  public async componentDidMount(): Promise<void> {
    await this.checkDelayedActions();
  }

  public async componentDidUpdate(): Promise<void> {
    await this.checkDelayedActions();
  }

  // This method is called when the component is removed from the document
  public componentWillUnmount(): void {
    this.debounce.unsubscribeAll();
  }

  private async onClick(event: React.MouseEvent): Promise<void> {
    event.stopPropagation();

    if (this.props.disabled
      || this.state.isDebounceDelay
      || WorkspaceDeleteAction.shouldDelete.includes(this.props.workspaceId)) {
      return;
    }

    this.debounce.setDelay();
    if (this.props.status !== WorkspaceStatus.STOPPED) {
      if (!WorkspaceDeleteAction.shouldDelete.includes(this.props.workspaceId)) {
        WorkspaceDeleteAction.shouldDelete.push(this.props.workspaceId);
      }
      try {
        await this.props.stopWorkspace(this.props.workspaceId);
      } catch (e) {
        this.showAlert(`Unable to stop the workspace. ${e}`);
        return;
      }
      return;
    }

    try {
      await this.props.deleteWorkspace(this.props.workspaceId);
      this.showAlert('Workspace successfully deleted.', AlertVariant.success);
    } catch (e) {
      this.showAlert(`Unable to delete the workspace. ${e}`);
      return;
    }
  }

  public render(): React.ReactElement {
    const tooltipContent = 'Delete Workspace';
    const { workspaceId, disabled, children } = this.props;
    const { isDebounceDelay } = this.state;
    const shouldDelete = WorkspaceDeleteAction.shouldDelete.includes(workspaceId);
    const className = disabled || isDebounceDelay || shouldDelete ? styles.disabledWorkspaceStatus : styles.workspaceStatus;

    if (children) {
      return (<div onClick={e => this.onClick(e)}>{children}</div>);
    }

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

type MappedProps = ConnectedProps<typeof connector>;
export default connector(WorkspaceDeleteAction);
