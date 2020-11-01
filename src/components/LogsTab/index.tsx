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

import { FileIcon } from '@patternfly/react-icons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { WorkspaceStatus } from '../../services/workspaceStatus';
import LogsTools from './LogsTools';
import { AppState } from '../../store';
import { selectAllWorkspaces, selectLogs } from '../../store/Workspaces/selectors';

import styles from './LogsTab.module.css';

type Props =
  { workspaceId: string }
  & MappedProps;

type State = {
  isExpanded?: boolean;
  isStopped?: boolean;
  hasError?: boolean;
  logs: string[];
};

export class LogsTab extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isExpanded: false,
      isStopped: true,
      hasError: false,
      logs: [],
    };
  }

  public componentDidMount(): void {
    this.updateLogsData();
  }

  public componentDidUpdate(): void {
    this.updateLogsData();
  }

  private updateLogsData() {
    const { workspaceId, workspacesLogs, allWorkspaces } = this.props;
    if (allWorkspaces && allWorkspaces.length > 0 && workspaceId) {
      const workspace = allWorkspaces.find(workspace => workspace.id === workspaceId);
      const hasError = workspace && workspace.status === WorkspaceStatus[WorkspaceStatus.ERROR];
      const isStopped = workspace && workspace.status === WorkspaceStatus[WorkspaceStatus.STOPPED];
      const logs = workspacesLogs && workspacesLogs.has(workspaceId) ? workspacesLogs.get(workspaceId) : [];
      if (logs && this.state.logs.length !== logs.length
        || this.state.hasError !== hasError
        || this.state.isStopped !== isStopped) {
        this.setState({ logs: logs ? logs : [], hasError, isStopped });
      }
    }
  }

  render() {
    const { isExpanded, logs, hasError, isStopped } = this.state;

    if (isStopped) {
      return (
        <div className={styles.emptyState}>
          <FileIcon />
          <h1>No Logs to display</h1>
          <small>Logs will be displayed in a running workspace.</small>
        </div>
      );
    }

    return (
      <React.Fragment>
        <div className={isExpanded ? styles.tabExpanded : ''} style={{ marginTop: '15px' }}>
          <LogsTools logs={logs} handleExpand={isExpanded => {
            this.setState({ isExpanded, logs });
          }} />
          <div className={styles.consoleOutput}>
            <div>{logs.length} lines</div>
            <pre className={hasError ? styles.errorColor : ''}>{logs.join('\n')}</pre>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const mapStateToProps = (state: AppState) => ({
  allWorkspaces: selectAllWorkspaces(state),
  workspacesLogs: selectLogs(state),
});

const connector = connect(mapStateToProps);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(LogsTab);
