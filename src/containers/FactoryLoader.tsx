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
import { delay } from '../services/delay';
import { AppState } from '../store';
import * as FactoryResolverStore from '../store/FactoryResolver';
import * as WorkspaceStore from '../store/Workspaces';
import FactoryLoaderPage from '../pages/FactoryLoader';
import { selectAllWorkspaces, selectWorkspaceById } from '../store/Workspaces/selectors';
import { WorkspaceStatus } from '../services/workspaceStatus';

const WS_ATTRIBUTES_TO_SAVE: string[] = ['workspaceDeploymentLabels', 'workspaceDeploymentAnnotations'];

type Props =
  MappedProps
  & { history: History };

export enum LoadFactorySteps {
  INITIALIZING = 1,
  LOOKING_FOR_DEVFILE = 2,
  APPLYING_DEVFILE = 3,
  CREATE_WORKSPACE = 4,
  START_WORKSPACE = 5,
  OPEN_IDE = 6
}

type State = {
  search?: string;
  location?: string;
  devfileLocationInfo?: string;
  currentStep: LoadFactorySteps;
  hasError: boolean;
};

export class FactoryLoader extends React.PureComponent<Props, State> {
  private loadFactoryPageCallbacks: { showAlert?: (variant: AlertVariant, title: string) => void } = {};
  private factoryResolver: FactoryResolverStore.State;

  constructor(props: Props) {
    super(props);

    const { search } = this.props.history.location;

    this.state = {
      currentStep: LoadFactorySteps.INITIALIZING,
      hasError: false,
      search,
    };
  }

  public showErrorAlert(message: string): void {
    this.setState({ hasError: true });
    if (this.loadFactoryPageCallbacks.showAlert) {
      this.loadFactoryPageCallbacks.showAlert(AlertVariant.danger, message);
    } else {
      console.error(message);
    }
  }

  public componentDidMount(): void {
    this.createWorkspaceFromFactory();
  }

  public async componentDidUpdate(): Promise<void> {
    const { history, workspace, factoryResolver } = this.props;
    if (this.state.search !== history.location.search) {
      this.setState({
        search: history.location.search,
        hasError: false,
      });
      return this.createWorkspaceFromFactory();
    }

    if (factoryResolver) {
      this.factoryResolver = factoryResolver;
    }

    if (this.state.currentStep === LoadFactorySteps.START_WORKSPACE && workspace && WorkspaceStatus[workspace.status] === WorkspaceStatus.RUNNING) {
      this.setState({ currentStep: LoadFactorySteps.OPEN_IDE });
      await delay();
      history.push(`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`);
    }

    if (workspace && WorkspaceStatus[workspace.status] === WorkspaceStatus.ERROR) {
      this.setState({ hasError: true });
    }
  }

  private async createWorkspaceFromFactory(): Promise<void> {
    const { search } = this.props.history.location;
    if (this.props.workspace) {
      this.props.clearWorkspaceId();
    }
    if (!search) {
      this.showErrorAlert('Failed to find search params.');
      return;
    } else {
      this.setState({ search, hasError: false });
    }
    const searchParam = new URLSearchParams(search.substring(1));

    // set devfile attributes
    const attrs: { [key: string]: string } = {};
    let location = '';
    let params = '';
    searchParam.forEach((val: string, key: string) => {
      if (key === 'url') {
        location = val;
      } else {
        if (WS_ATTRIBUTES_TO_SAVE.indexOf(key) !== -1) {
          attrs[key] = val;
        }
        params += `${!params ? '?' : '&'}${key}=${val}`;
      }
    });
    attrs.stackName = `${location}${params}`;
    this.setState({ currentStep: LoadFactorySteps.LOOKING_FOR_DEVFILE });
    if (!location) {
      this.showErrorAlert('Failed to find a repository URL.');
      return;
    }
    this.setState({ currentStep: LoadFactorySteps.APPLYING_DEVFILE, location });
    await delay();
    try {
      await this.props.requestFactoryResolver(location);
    } catch (e) {
      this.showErrorAlert('Failed to resolve a devfile.');
      return;
    }
    if (!this.factoryResolver
      || !this.factoryResolver.resolver
      || !this.factoryResolver.resolver.devfile
      || this.factoryResolver.resolver.location !== location) {
      this.showErrorAlert('Failed to resolve a devfile.');
      return;
    }
    const { source } = this.factoryResolver.resolver;
    const devfileLocationInfo = source === 'repo' ? '' : `${source} from the ${location}`;
    this.setState({ currentStep: LoadFactorySteps.APPLYING_DEVFILE, devfileLocationInfo });
    const devfile = this.factoryResolver.resolver.devfile;
    this.setState({ currentStep: LoadFactorySteps.CREATE_WORKSPACE });
    await delay();

    let workspace: che.Workspace | null = null;
    try {
      workspace = await this.props.createWorkspaceFromDevfile(devfile, undefined, undefined, attrs) as any;
    } catch (e) {
      this.showErrorAlert('Failed to create a workspace.');
      return;
    }
    if (!workspace) {
      this.showErrorAlert('Failed to create a workspace.');
      return;
    }
    this.props.setWorkspaceId(workspace.id);
    this.setState({ currentStep: LoadFactorySteps.START_WORKSPACE });
    await delay();
    const workspaceName = workspace.devfile.metadata.name;
    try {
      await this.props.startWorkspace(`${workspace.id}`);
    } catch (e) {
      this.showErrorAlert(`Workspace ${workspaceName} failed to start.`);
      return;
    }
  }

  render() {
    const { workspace } = this.props;
    const { currentStep, devfileLocationInfo, hasError } = this.state;
    const workspaceName = workspace && workspace.devfile.metadata.name ? workspace.devfile.metadata.name : '';
    const workspaceId = workspace ? workspace.id : '';

    return (
      <FactoryLoaderPage
        currentStep={currentStep}
        hasError={hasError}
        devfileLocationInfo={devfileLocationInfo}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        callbacks={this.loadFactoryPageCallbacks}
      />
    );
  }

}

const mapStateToProps = (state: AppState) => ({
  factoryResolver: state.factoryResolver,
  workspace: selectWorkspaceById(state),
  allWorkspaces: selectAllWorkspaces(state),
});

const connector = connect(
  mapStateToProps,
  {
    ...FactoryResolverStore.actionCreators,
    ...WorkspaceStore.actionCreators,
  },
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(FactoryLoader);
