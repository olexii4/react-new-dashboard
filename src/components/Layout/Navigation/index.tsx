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
import { connect } from 'react-redux';
import { Nav } from '@patternfly/react-core';

import { ThemeVariant } from '../themeVariant';
import { AppState } from '../../../store';
import NavigationMainList from './MainList';
import NavigationRecentList from './RecentList';
import * as WorkspaceState from '../../../store/Workspaces';

export interface NavigationItemObject {
  to: string,
  label: string,
  icon: React.ReactElement;
}
export interface NavigationRecentItemObject {
  to: string,
  label: string,
  status: string | undefined;
}

type Props = {
  theme: ThemeVariant;
} & {
  workspaceStore: WorkspaceState.WorkspacesState;
} &
  WorkspaceState.ActionCreators;
type State = {
  activeItem: string;
  recent: Array<che.Workspace>;
};

export class Navigation extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const recent = this.props.getRecent(5);

    this.state = {
      activeItem: '',
      recent,
    };
  }

  private onNavSelect(selected: any): void {
    this.setState({ activeItem: selected.itemId });
  }

  public render(): React.ReactElement {
    const { theme } = this.props;
    const { activeItem, recent } = this.state;

    return (
      <Nav
        aria-label='Navigation'
        onSelect={selected => this.onNavSelect(selected)}
        theme={theme}
      >
        <NavigationMainList activeItem={activeItem} />
        <NavigationRecentList workspaces={recent} activeItem={activeItem} />
      </Nav>
    );
  }

}

export default connect(
  (state: AppState) => {
    return {
      workspaceStore: state.workspaces,
    };
  },
  WorkspaceState.actionCreators,
)(Navigation);
