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
import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { WorkspaceStatus } from '../../services/workspaceStatus';
import LogsTools from './LogsTools';
import { AppState } from '../../store';
import { selectAllWorkspaces, selectLogs } from '../../store/Workspaces/selectors';

import styles from './index.module.css';

type Props =
  { workspaceId: string }
  & MappedProps;

type State = {
  isExpanded: boolean;
  isStopped: boolean;
  hasError: boolean;
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
    if (allWorkspaces && allWorkspaces.length > 0) {

      const workspace = allWorkspaces.find(workspace => workspace.id === workspaceId);
      if (!workspace) {
        return;
      }

      const hasError = WorkspaceStatus[workspace.status] === WorkspaceStatus.ERROR;
      if (this.state.hasError !== hasError) {
        this.setState({ hasError });
      }

      const isStopped = WorkspaceStatus[workspace.status] === WorkspaceStatus.STOPPED;
      if (this.state.isStopped !== isStopped) {
        this.setState({ isStopped });
      }

      if (workspacesLogs) {
        const logs = workspacesLogs.get(workspaceId);
        if (logs && (logs.length !== this.state.logs.length)) {
          this.setState({ logs });
        }
      }
    }
  }

  render() {
    const { isExpanded, logs, hasError, isStopped } = this.state;

    if (isStopped) {
      return (
        <EmptyState style={{ backgroundColor: '#f1f1f1' }}>
          <EmptyStateIcon icon={FileIcon} />
          <Title headingLevel="h4" size="lg">
            No Logs to display
          </Title>
          <EmptyStateBody>
            Logs will be displayed in a running workspace.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <PageSection variant={PageSectionVariants.light}>
        <div className={isExpanded ? styles.tabExpanded : ''}>
          <LogsTools logs={logs} handleExpand={isExpanded => {
            this.setState({ isExpanded, logs });
          }} />
          <div className={styles.consoleOutput}>
            <div>{logs.length} lines</div>
            <pre className={hasError ? styles.errorColor : ''}>{logs.join('\n')}</pre>
          </div>
        </div>
      </PageSection>
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
