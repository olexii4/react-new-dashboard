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
import WorkspaceDetailsPage from '../pages/WorkspaceDetails';

type Props =
  MappedProps
  & { history: History }
  & RouteComponentProps<{ namespace: string; workspaceName: string }>; // incoming parameters

export class WorkspaceDetails extends React.PureComponent<Props> {

  constructor(props) {
    super(props);

    const { namespace, workspaceName } = this.props.match.params;
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
  }

  render() {
    return (
      <WorkspaceDetailsPage
        history={this.props.history}
      />
    );
  }

}

const mapStateToProps = (state: AppState) => ({
  isLoading: selectIsLoading(state),
  allWorkspaces: selectAllWorkspaces(state),
});

const connector = connect(
  mapStateToProps,
  WorkspacesStore.actionCreators
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(WorkspaceDetails);
