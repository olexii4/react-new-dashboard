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
import { History } from 'history';
import { AppState } from '../../store';
import * as WorkspacesStore from '../../store/Workspaces';
import { Button, PageSection, PageSectionVariants, Text } from '@patternfly/react-core';
import CheProgress from '../../components/Progress';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import WorkspaceIndicator from '../../components/workspace/Indicator';
import WorkspaceStatus from '../../components/workspace/Status';
import WorkspaceDeleteAction from '../../components/workspace/DeleteAction';
import { Debounce } from '../../services/debounce/Debounce';
import { container } from '../../inversify.config';
import { selectIsLoading, selectAllWorkspaces } from '../../store/Workspaces/selectors';

import './WorkspacesList.styl';

const SECTION_THEME = PageSectionVariants.light;

// At runtime, Redux will merge together...
type Props =
  MappedProps
  & {
    history: History
  };

export class WorkspacesList extends React.PureComponent<Props> {
  private debounce: Debounce;

  constructor(props: Props) {
    super(props);

    this.debounce = container.get(Debounce);
  }

  // This method is called when the component is first added to the document
  public componentDidMount(): void {
    this.ensureDataFetched();
  }

  // This method is called when the route parameters change
  public componentDidUpdate(): void {
    this.ensureDataFetched();
  }

  public render(): React.ReactElement {
    const onRowClick = (workspace: che.Workspace): void => {
      this.props.history.push(`/workspace/${workspace.namespace}/${workspace.devfile.metadata.name}`);
    };

    const allWorkspaces = this.props.allWorkspaces || [];

    const columns = ['NAME', 'RAM', 'PROJECTS', 'STACK', 'ACTIONS'];
    const rows = allWorkspaces.map((workspace: che.Workspace) => ({
      cells: [
        <span key={`${workspace.id}_1`} onClick={(): void => onRowClick(workspace)}>
          <WorkspaceIndicator key={`${workspace.id}_1_1`} status={workspace.status} />
          {workspace.namespace}/{workspace.devfile.metadata.name}
        </span>,
        <span key={`${workspace.id}_2`} onClick={(): void => onRowClick(workspace)}>
          -
                    </span>,
        <span key={`${workspace.id}_3`} onClick={(): void => onRowClick(workspace)}>
          {workspace.devfile.projects ? workspace.devfile.projects.length : '-'}
        </span>,
        <span key={`${workspace.id}_4`} onClick={(): void => onRowClick(workspace)}>
          {workspace.attributes && workspace.attributes.stackName ? workspace.attributes.stackName : ''}
        </span>,
        <span key={`${workspace.id}_5`}>
          <WorkspaceStatus key={`status_${workspace.id}${workspace.status}`}
            workspaceId={workspace.id as string}
            status={workspace.status as string}
            startWorkspace={this.props.startWorkspace}
            stopWorkspace={this.props.stopWorkspace} />
          <WorkspaceDeleteAction key={`delete_${workspace.id}${workspace.status}`}
            workspaceId={workspace.id as string}
            status={workspace.status as string}
            deleteWorkspace={this.props.deleteWorkspace} />
        </span>
      ]
    })) || [];

    const { workspace } = this.props.branding.data.docs;

    return (
      <React.Fragment>
        <PageSection variant={SECTION_THEME}>
          <Text className='page-label' component='h1'>Workspaces</Text>
        </PageSection>
        <Text className='page-description' component='p'>
          A workspace is where your projects live and run.
          Create workspaces from stacks that define projects, runtimes, and commands.
                    <a href={workspace}>Learn more.</a>
        </Text>
        <CheProgress isLoading={this.props.isLoading} />
        <PageSection variant={SECTION_THEME} className='header-buttons'>
          <Button onClick={(): void => this.props.history.push('/')} variant='primary'>
            Add Workspace
                    </Button>
        </PageSection>
        <PageSection variant={SECTION_THEME}>
          {rows.length === 0 ? (<Text component='p' className='workspaces-list-empty-state'>
            There are no workspaces.
          </Text>) :
            (<Table cells={columns}
              rows={rows}
              aria-label='Workspaces'>
              <TableHeader className='workspaces-list-table-header' />
              <TableBody className='workspaces-list-table-body' />
            </Table>)}
        </PageSection>
      </React.Fragment>
    );
  }

  private ensureDataFetched(): void {
    if (this.debounce.hasDelay()) {
      return;
    }
    this.props.requestWorkspaces();
    this.debounce.setDelay();
  }
}

const mapStateToProps = (state: AppState) => {
  const { branding } = state;
  return {
    branding,
    isLoading: selectIsLoading(state),
    allWorkspaces: selectAllWorkspaces(state),
  };
};

const connector = connect(
  mapStateToProps,
  WorkspacesStore.actionCreators,
);
type MappedProps = ConnectedProps<typeof connector>;
export default connector(WorkspacesList);
