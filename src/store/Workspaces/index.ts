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

import { Action, Reducer } from 'redux';
import { AppThunkAction, AppState } from '../';
import {
  createWorkspaceFromDevfile,
  deleteWorkspace,
  fetchSettings,
  fetchWorkspaces,
  startWorkspace,
  stopWorkspace,
  updateWorkspace,
} from '../../services/api/workspace';
import { container } from '../../inversify.config';
import { CheJsonRpcApi } from '../../services/json-rpc/JsonRpcApiFactory';
import { JsonRpcMasterApi } from '../../services/json-rpc/JsonRpcMasterApi';

// This state defines the type of data maintained in the Redux store.
export interface State {
  isLoading: boolean;
  settings: che.WorkspaceSettings;
  workspaces: che.Workspace[];
}

interface RequestWorkspacesAction {
  type: 'REQUEST_WORKSPACES';
}

interface ReceiveErrorAction {
  type: 'RECEIVE_ERROR';
}

interface ReceiveWorkspacesAction {
  type: 'RECEIVE_WORKSPACES';
  workspaces: che.Workspace[];
}

interface UpdateWorkspaceAction {
  type: 'UPDATE_WORKSPACE';
  workspace: che.Workspace;
}

interface DeleteWorkspaceAction {
  type: 'DELETE_WORKSPACE';
  workspaceId: string;
}

interface AddWorkspaceAction {
  type: 'ADD_WORKSPACE';
  workspace: che.Workspace;
}

interface ReceiveSettingsAction {
  type: 'RECEIVE_SETTINGS';
  settings: che.WorkspaceSettings;
}

type KnownAction =
  RequestWorkspacesAction
  | ReceiveErrorAction
  | ReceiveWorkspacesAction
  | UpdateWorkspaceAction
  | DeleteWorkspaceAction
  | AddWorkspaceAction
  | ReceiveSettingsAction;

export enum WorkspaceStatus {
  RUNNING = 1,
  STOPPED,
  PAUSED,
  STARTING,
  STOPPING,
  ERROR
}

const cheJsonRpcApi = container.get(CheJsonRpcApi);
let jsonRpcMasterApi: JsonRpcMasterApi;

export type ActionCreators = {
  requestWorkspaces: () => any;
  startWorkspace: (workspaceId: string) => any;
  stopWorkspace: (workspaceId: string) => any;
  deleteWorkspace: (workspaceId: string) => any;
  updateWorkspace: (workspace: che.Workspace) => any;
  createWorkspaceFromDevfile: (
    devfile: che.WorkspaceDevfile,
    cheNamespace: string | undefined,
    infrastructureNamespace: string | undefined,
    attributes: { [key: string]: string },
  ) => any;
  requestSettings: () => any;

  getById: (id: string) => any;
  getByQualifiedName: (cheNamespace: string, name: string) => any;
  getRecent: (num: number) => any;
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  requestWorkspaces: (): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<void> => {
    const appState = getState();

    // Lazy initialization of jsonRpcMasterApi
    if (!jsonRpcMasterApi) {
      // TODO change this test implementation to the real one
      const jsonRpcApiLocation = new URL(window.location.href).origin.replace('http', 'ws') + appState.branding.data.websocketContext;
      jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
    }

    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspaces = await fetchWorkspaces();
      jsonRpcMasterApi.unSubscribeAllWorkspaceStatus();
      workspaces.forEach(workspace => {
        jsonRpcMasterApi.subscribeWorkspaceStatus(workspace.id as string, (message: any) => {
          const status = message.error ? 'ERROR' : message.status;
          if (WorkspaceStatus[status]) {
            workspace.status = status;
            dispatch({ type: 'UPDATE_WORKSPACE', workspace });
          }
        });
      });
      dispatch({ type: 'RECEIVE_WORKSPACES', workspaces });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to request workspaces: \n' + e);
    }

  },

  requestSettings: (): AppThunkAction<KnownAction> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const settings = await fetchSettings();
      dispatch({ type: 'RECEIVE_SETTINGS', settings });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to fetch settings, \n' + e);
    }
  },

  startWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspace = await startWorkspace(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to start the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  stopWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspace = await stopWorkspace(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to stop the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  deleteWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      await deleteWorkspace(workspaceId);
      dispatch({ type: 'DELETE_WORKSPACE', workspaceId });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to delete the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  updateWorkspace: (workspace: che.Workspace): AppThunkAction<KnownAction> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const updatedWorkspace = await updateWorkspace(workspace);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace: updatedWorkspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to update the workspace, ID: ${workspace.id}, ` + e);
    }
  },

  createWorkspaceFromDevfile: (
    devfile: che.WorkspaceDevfile,
    cheNamespace: string | undefined,
    infrastructureNamespace: string | undefined,
    attributes: { [key: string]: string } = {},
  ): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<void> => {

    const appState = getState();

    // Lazy initialization of jsonRpcMasterApi
    if (!jsonRpcMasterApi) {
      // TODO change this test implementation to the real one
      const jsonRpcApiLocation = new URL(window.location.href).origin.replace('http', 'ws') + appState.branding.data.websocketContext;
      jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
    }

    dispatch({ type: 'REQUEST_WORKSPACES' });
    try {
      const workspace = await createWorkspaceFromDevfile(
        devfile,
        cheNamespace,
        infrastructureNamespace,
        attributes
      );
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });

      jsonRpcMasterApi.subscribeWorkspaceStatus(workspace.id, (message: any) => {
        const status = message.error ? 'ERROR' : message.status;
        if (WorkspaceStatus[status]) {
          workspace.status = status;
          dispatch({ type: 'UPDATE_WORKSPACE', workspace });
        }
      });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to create a new workspace from the devfile: \n' + e);
    }
  },

  getById: (id: string): AppThunkAction<KnownAction> =>
    (dispatch, getState): che.Workspace | undefined => {
      const appState: AppState = getState();
      if (!appState || !appState.workspaces) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      return appState.workspaces.workspaces
        .find(workspace => workspace.id === id);
    },

  getByQualifiedName: (cheNamespace: string, name: string): AppThunkAction<KnownAction> =>
    (dispatch, getState): che.Workspace | undefined => {
      const appState: AppState = getState();
      if (!appState || !appState.workspaces) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      return appState.workspaces.workspaces
        .find(workspace =>
          workspace.namespace === cheNamespace
          && workspace.devfile.metadata.name === name);
    },

  getRecent: (num: number): AppThunkAction<KnownAction> =>
    (dispatch, getState): Array<che.Workspace> => {
      const appState: AppState = getState();
      if (!appState || !appState.workspaces) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      return appState.workspaces.workspaces
        // sort workspaces by the updating/creating time
        .sort((a, b) => {
          const timeA = (a.attributes && (a.attributes.updated || a.attributes.created)) || 0;
          const timeB = (b.attributes && (b.attributes.updated || b.attributes.created)) || 0;
          if (timeA > timeB) {
            return -1;
          } else if (timeA < timeB) {
            return 1;
          } else {
            return 0;
          }
        })
        // return necessary number of workspaces
        .slice(0, num);
    },
};

const unloadedState: State = {
  workspaces: [],
  settings: {} as che.WorkspaceSettings,
  isLoading: false,
};

export const reducer: Reducer<WorkspacesState> = (state: WorkspacesState | undefined, incomingAction: Action): WorkspacesState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_WORKSPACES':
      return {
        workspaces: state.workspaces,
        settings: state.settings,
        isLoading: true
      };
    case 'RECEIVE_ERROR':
      return {
        workspaces: state.workspaces,
        settings: state.settings,
        isLoading: false
      };
    case 'UPDATE_WORKSPACE':
      return {
        workspaces: state.workspaces.map((workspace: che.Workspace) => {
          return workspace.id === action.workspace.id ? action.workspace : workspace;
        }),
        settings: state.settings,
        isLoading: false
      };
    case 'ADD_WORKSPACE':
      return {
        workspaces: state.workspaces.concat([action.workspace]),
        settings: state.settings,
        isLoading: false
      };
    case 'DELETE_WORKSPACE':
      return {
        workspaces: state.workspaces.filter(workspace => workspace.id !== action.workspaceId),
        settings: state.settings,
        isLoading: false
      };
    case 'RECEIVE_WORKSPACES':
      if (action) {
        return {
          workspaces: action.workspaces,
          settings: state.settings,
          isLoading: false
        };
      }
      break;
    case 'RECEIVE_SETTINGS':
      if (action) {
        return {
          workspaces: state.workspaces,
          settings: action.settings,
          isLoading: false,
        };
      }
  }

  return state;
};
