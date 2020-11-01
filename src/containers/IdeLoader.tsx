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

import { AlertVariant } from '@patternfly/react-core';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { History } from 'history';
import { RouteComponentProps } from 'react-router';
import { timeout } from '../services/timeout';
import { AppState } from '../store';
import * as WorkspaceStore from '../store/Workspaces';
import IdeLoaderPage from '../pages/IdeLoader';
import { selectAllWorkspaces, selectWorkspaceById } from '../store/Workspaces/selectors';
import { WorkspaceStatus } from '../services/workspaceStatus';

type Props =
  MappedProps
  & { history: History }
  & RouteComponentProps<{ namespace: string; workspaceName: string }>;

type State = {
  namespace?: string,
  workspaceName?: string,
  workspaceId?: string,
  currentStep: number;
  ideUrl?: string;
  hasError?: boolean;
};

class IdeLoader extends React.PureComponent<Props, State> {
  private readonly loadFactoryPageCallbacks: {
    showAlert?: (variant: AlertVariant.success | AlertVariant.danger, title: string) => void
  };

  constructor(props: Props) {
    super(props);

    this.loadFactoryPageCallbacks = {};
    const { match: { params }, history } = this.props;
    const namespace = params.namespace;
    const workspaceName = (params.workspaceName.split('&'))[0];

    if (workspaceName !== params.workspaceName) {
      const pathname = `/ide/${namespace}/${workspaceName}`;
      history.replace({ pathname });
    }

    this.state = {
      currentStep: 1,
      namespace,
      workspaceName
    };
  }

  public showErrorAlert(message: string): void {
    this.setState({
      currentStep: this.state.currentStep,
      hasError: true,
    });
    if (this.loadFactoryPageCallbacks.showAlert) {
      this.loadFactoryPageCallbacks.showAlert(AlertVariant.danger, message);
    } else {
      console.error(message);
    }
  }

  public async componentDidMount(): Promise<void> {
    const { allWorkspaces, requestWorkspaces } = this.props;
    if (!allWorkspaces || allWorkspaces.length === 0) {
      await requestWorkspaces();
    }

    await this.initWorkspace();
  }

  public async componentDidUpdate(): Promise<void> {
    const { allWorkspaces, match: { params } } = this.props;
    const { currentStep } = this.state;
    const workspace = allWorkspaces.find(workspace =>
      workspace.namespace === params.namespace && workspace.devfile.metadata.name === params.workspaceName);
    if (workspace && WorkspaceStatus[workspace.status] === WorkspaceStatus.ERROR) {
      this.setState({
        currentStep,
        hasError: true,
      });
      return;
    }
    await this.initWorkspace();
  }

  private async openIDE(workspaceId: string): Promise<void> {
    await this.props.requestWorkspace(workspaceId);
    const { workspace } = this.props;
    if (!workspace || !workspace.runtime) {
      return;
    }
    let ideUrl = '';
    const machines = workspace.runtime.machines || {};
    for (const machineName of Object.keys(machines)) {
      const servers = machines[machineName].servers || {};
      for (const serverId of Object.keys(servers)) {
        const attributes = (servers[serverId] as any).attributes;
        if (attributes && attributes['type'] === 'ide') {
          ideUrl = servers[serverId].url;
          break;
        }
      }
    }
    if (!ideUrl) {
      this.showErrorAlert('Don\'t know what to open, IDE url is not defined.');
      return;
    }
    await timeout();
    this.setState({ currentStep: 4, ideUrl });
  }

  private async initWorkspace(): Promise<void> {
    const { allWorkspaces, match: { params } } = this.props;
    const { namespace, workspaceName } = this.state;

    if (namespace !== params.namespace || workspaceName !== params.workspaceName) {
      this.setState({ currentStep: 1, namespace, workspaceName });
      await timeout();
      return;
    } else if (this.state.currentStep > 2) {
      return;
    }
    const workspace = allWorkspaces.find(workspace =>
      workspace.namespace === params.namespace && workspace.devfile.metadata.name === params.workspaceName);
    if (workspace) {
      this.setState({ currentStep: this.state.currentStep, workspaceId: workspace.id });
      if (this.state.currentStep === 2 && WorkspaceStatus[workspace.status] === WorkspaceStatus.RUNNING) {
        this.setState({ currentStep: 3 });
        return this.openIDE(workspace.id);
      }
    } else {
      this.showErrorAlert('Failed to find the target workspace.');
      return;
    }
    await timeout();
    this.setState({ currentStep: 2 });
    if (WorkspaceStatus[workspace.status] === WorkspaceStatus.STOPPED) {
      try {
        await this.props.startWorkspace(`${workspace.id}`);
      } catch (e) {
        this.showErrorAlert(`Workspace ${this.state.workspaceName} failed to start.`);
        return;
      }
    }
  }

  render() {
    const { currentStep, hasError, ideUrl, workspaceId, workspaceName } = this.state;

    return (
      <IdeLoaderPage
        currentStep={currentStep}
        workspaceId={workspaceId || ''}
        ideUrl={ideUrl}
        hasError={hasError === true}
        workspaceName={workspaceName || ''}
        callbacks={this.loadFactoryPageCallbacks}
      />
    );
  }

}

const mapStateToProps = (state: AppState) => ({
  workspace: selectWorkspaceById(state),
  allWorkspaces: selectAllWorkspaces(state),
});

const connector = connect(
  mapStateToProps,
  WorkspaceStore.actionCreators,
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(IdeLoader);
