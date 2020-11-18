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
import { History } from 'history';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { container } from '../inversify.config';
import IdeLoaderPage from '../pages/IdeLoader';
import { Debounce } from '../services/debounce/Debounce';
import { WorkspaceStatus } from '../services/workspaceStatus';
import { AppState } from '../store';
import * as WorkspaceStore from '../store/Workspaces';
import { selectAllWorkspaces, selectWorkspaceById } from '../store/Workspaces/selectors';

type Props =
  MappedProps
  & { history: History }
  & RouteComponentProps<{ namespace: string; workspaceName: string }>;

export enum LoadIdeSteps {
  INITIALIZING = 1,
  START_WORKSPACE,
  OPEN_IDE
}

type State = {
  namespace: string,
  workspaceName: string,
  workspaceId?: string,
  currentStep: LoadIdeSteps;
  ideUrl?: string;
  hasError?: boolean;
};

class IdeLoader extends React.PureComponent<Props, State> {
  private debounce: Debounce;
  private readonly loadFactoryPageCallbacks: {
    showAlert?: (variant: AlertVariant, title: string) => void
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
      currentStep: LoadIdeSteps.INITIALIZING,
      namespace,
      workspaceName,
    };

    this.debounce = container.get(Debounce);
    this.debounce.subscribe(async () => {
      await this.initWorkspace();
    });
  }

  public showAlert(message: string, alertVariant: AlertVariant = AlertVariant.danger): void {
    if (alertVariant === AlertVariant.danger) {
      this.setState({ hasError: true });
    }
    if (this.loadFactoryPageCallbacks.showAlert) {
      this.loadFactoryPageCallbacks.showAlert(alertVariant, message);
    } else {
      console.error(message);
    }
  }

  public async componentWillUnmount(): Promise<void> {
    this.debounce.unsubscribeAll();
  }

  public async componentDidMount(): Promise<void> {
    const { allWorkspaces, requestWorkspaces } = this.props;
    if (!allWorkspaces || allWorkspaces.length === 0) {
      requestWorkspaces();
      return;
    }
    const workspace = allWorkspaces.find(workspace =>
      workspace.namespace === this.state.namespace && workspace.devfile.metadata.name === this.state.workspaceName);
    if (workspace && workspace.runtime && workspace.status === WorkspaceStatus[WorkspaceStatus.RUNNING]) {
      this.updateIdeUrl(workspace.runtime);
      return;
    }
    this.debounce.setDelay(1000);
  }

  public async componentDidUpdate(): Promise<void> {
    const { allWorkspaces, match: { params } } = this.props;
    const { hasError } = this.state;
    const workspace = allWorkspaces.find(workspace =>
      workspace.namespace === params.namespace && workspace.devfile.metadata.name === params.workspaceName);
    if (workspace && !hasError && workspace.status === WorkspaceStatus[WorkspaceStatus.ERROR]) {
      try {
        await this.props.requestWorkspace(workspace.id);
      } catch (e) {
        this.showAlert(`Getting workspace detail data failed. ${e}`);
        return;
      }
    }
    this.debounce.setDelay(1000);
  }

  private updateIdeUrl(runtime: api.che.workspace.Runtime): void {
    let ideUrl = '';
    const machines = runtime.machines || {};
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
      this.showAlert('Don\'t know what to open, IDE url is not defined.');
      return;
    }
    this.setState({ currentStep: LoadIdeSteps.OPEN_IDE, ideUrl });
  }

  private async openIDE(workspaceId: string): Promise<void> {
    this.setState({ currentStep: LoadIdeSteps.OPEN_IDE });
    try {
      await this.props.requestWorkspace(workspaceId);
    } catch (e) {
      this.showAlert(`Getting workspace detail data failed. ${e}`);
      return;
    }
    const workspace = this.props.allWorkspaces.find(workspace =>
      workspace.id === workspaceId);
    if (workspace && workspace.runtime) {
      this.updateIdeUrl(workspace.runtime);
    }
  }

  private async initWorkspace(): Promise<void> {
    const { allWorkspaces, match: { params } } = this.props;
    const { namespace, workspaceName } = this.state;

    if (namespace !== params.namespace || workspaceName !== params.workspaceName) {
      this.setState({
        currentStep: LoadIdeSteps.INITIALIZING,
        hasError: false,
        ideUrl: '',
        namespace: params.namespace,
        workspaceName: params.workspaceName,
      });
      return;
    } else if (this.state.currentStep === LoadIdeSteps.OPEN_IDE) {
      return;
    }
    const workspace = allWorkspaces.find(workspace =>
      workspace.namespace === params.namespace && workspace.devfile.metadata.name === params.workspaceName);
    if (workspace) {
      this.setState({ workspaceId: workspace.id });
      if ((workspace.runtime || this.state.currentStep === LoadIdeSteps.START_WORKSPACE) &&
        workspace.status === WorkspaceStatus[WorkspaceStatus.RUNNING]) {
        return this.openIDE(workspace.id);
      }
    } else {
      this.showAlert('Failed to find the target workspace.');
      return;
    }
    if (this.state.currentStep === LoadIdeSteps.INITIALIZING) {
      this.setState({ currentStep: LoadIdeSteps.START_WORKSPACE });
      if (workspace.status === WorkspaceStatus[WorkspaceStatus.STOPPED] ||
        workspace.status === WorkspaceStatus[WorkspaceStatus.ERROR]) {
        try {
          await this.props.startWorkspace(`${workspace.id}`);
        } catch (e) {
          this.showAlert(`Workspace ${this.state.workspaceName} failed to start. ${e}`);
          return;
        }
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
// need a different type for testing
type MappedProps = ConnectedProps<typeof connector> | any
export default connector(IdeLoader);
