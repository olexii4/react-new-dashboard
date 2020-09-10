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

import { createSelector } from 'reselect';
import { AppState } from '../';

const selectWorkspacesState = (state: AppState) => state.workspaces;

export const selectIsLoading = createSelector(
  selectWorkspacesState,
  state => state.isLoading,
);

export const selectSettings = createSelector(
  selectWorkspacesState,
  state => state.settings,
);

export const selectAllWorkspaces = createSelector(
  selectWorkspacesState,
  state => {
    if (state.isLoading || state.workspaces.length === 0) {
      return null;
    }
    return state.workspaces;
  }
);

export const selectWorkspaceByQualifiedName = createSelector(
  selectWorkspacesState,
  selectAllWorkspaces,
  (state, allWorkspace) => {
    if (!allWorkspace) {
      return null;
    }
    return allWorkspace.find(workspace =>
      workspace.namespace === state.namespace && workspace.devfile.metadata.name === state.workspaceName);
  }
);

export const selectAllWorkspacesSortedByTime = createSelector(
  selectAllWorkspaces,
  (allWorkspaces) => {
    if (!allWorkspaces) {
      return null;
    }

    return allWorkspaces.sort(sortByTimeFn);
  }
);
const sortByTimeFn = (workspaceA: che.Workspace, workspaceB: che.Workspace): -1 | 0 | 1 => {
  const timeA = (workspaceA.attributes
    && (workspaceA.attributes.updated || workspaceA.attributes.created)) || 0;
  const timeB = (workspaceB.attributes
    && (workspaceB.attributes.updated || workspaceB.attributes.created)) || 0;
  if (timeA > timeB) {
    return -1;
  } else if (timeA < timeB) {
    return 1;
  } else {
    return 0;
  }
};

export const selectRecentWorkspaces = createSelector(
  selectWorkspacesState,
  selectAllWorkspacesSortedByTime,
  (state, workspacesSortedByTime) => {
    if (!workspacesSortedByTime) {
      return null;
    }

    return workspacesSortedByTime.slice(0, state.recentNumber);
  }
);
