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
import { RouteComponentProps } from 'react-router';
import { History } from 'history';

import { AppState } from '../store';
import * as WorkspacesStore from '../store/Workspaces';
import {
  selectIsLoading,
  selectAllWorkspaces,
} from '../store/Workspaces/selectors';
import WorkspaceDetailsPage, { WorkspaceDetailsTabs, WorkspaceDetails as Details } from '../pages/WorkspaceDetails';
import { AlertVariant } from '@patternfly/react-core';

type Props =
  MappedProps
  & { history: History }
  & RouteComponentProps<{ namespace: string; workspaceName: string }>; // incoming parameters

class WorkspaceDetails extends React.PureComponent<Props> {
  workspaceDetailsPageRef: React.RefObject<Details>;
  private showAlert: (variant: AlertVariant.success | AlertVariant.danger, title: string, timeDelay?: number) => void;

  constructor(props: Props) {
    super(props);

    this.workspaceDetailsPageRef = React.createRef<Details>();
    const namespace = this.props.match.params.namespace;
    const workspaceName = (this.props.match.params.workspaceName.split('&'))[0];
    if (workspaceName !== this.props.match.params.workspaceName) {
      const pathname = `/workspace/${namespace}/${workspaceName}`;
      this.props.history.replace({ pathname });
    }

    const workspace = this.props.allWorkspaces?.find(workspace =>
      workspace.namespace === namespace && workspace.devfile.metadata.name === workspaceName);
    if (workspace) {
      this.props.setWorkspaceId(workspace.id);
    }
  }

  componentDidMount() {
    const { allWorkspaces } = this.props;
    if (!allWorkspaces || allWorkspaces.length === 0) {
      this.props.requestWorkspaces();
    }
    const showAlert = this.workspaceDetailsPageRef.current?.showAlert;
    this.showAlert = (variant: AlertVariant.success | AlertVariant.danger, title: string, timeDelay?: number) => {
      if (showAlert) {
        showAlert(variant, title, timeDelay);
      } else {
        console.error(title);
      }
    };
  }

  render() {
    return (
      <WorkspaceDetailsPage
        ref={this.workspaceDetailsPageRef}
        onSave={(workspace: che.Workspace) => this.onSave(workspace)}
      />
    );
  }

  async onSave(newWorkspaceObj: che.Workspace): Promise<void> {
    const namespace = newWorkspaceObj.namespace;
    const workspaceName = newWorkspaceObj.devfile.metadata.name;

    try {
      await this.props.updateWorkspace(newWorkspaceObj);
      this.showAlert(AlertVariant.success, 'Workspace has been updated', 2000);
      const pathname = `/workspace/${namespace}/${workspaceName}`;
      this.props.history.replace({ pathname });
      this.props.setWorkspaceId(newWorkspaceObj.id);
    } catch (e) {
      if (this.workspaceDetailsPageRef.current?.state.activeTabKey === WorkspaceDetailsTabs.Devfile) {
        throw new Error(e.toString().replace(/^Error: /gi, ''));
      }
      this.showAlert(AlertVariant.danger, 'Failed to update workspace data', 10000);
    }
  }

}

const mapStateToProps = (state: AppState) => ({
  isLoading: selectIsLoading(state),
  allWorkspaces: selectAllWorkspaces(state),
});

const connector = connect(
  mapStateToProps,
  WorkspacesStore.actionCreators,
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(WorkspaceDetails);
