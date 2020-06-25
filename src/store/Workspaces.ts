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
import { AppThunkAction } from './';
import {
  createWorkspaceFromDevfile,
  deleteWorkspace,
  fetchSettings,
  fetchWorkspaces,
  startWorkspace,
  stopWorkspace,
  updateWorkspace,
} from '../services/api/workspace';
import { container } from '../inversify.config';
import { CheJsonRpcApi } from '../services/json-rpc/JsonRpcApiFactory';
import { JsonRpcMasterApi } from '../services/json-rpc/JsonRpcMasterApi';

// This state defines the type of data maintained in the Redux store.
export interface WorkspacesState {
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
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  requestWorkspaces: (): AppThunkAction<KnownAction> => (dispatch, getState): Promise<Array<che.Workspace>> => {
    const appState = getState();

    if (appState && appState.workspaces) {

      // Lazy initialization of jsonRpcMasterApi
      if (!jsonRpcMasterApi) {
        // TODO change this test implementation to the real one
        const jsonRpcApiLocation = new URL(window.location.href).origin.replace('http', 'ws') + appState.branding.data.websocketContext;
        jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
      }

      const promise = fetchWorkspaces();
      promise.then(workspaces => {
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
      }).catch(error => {
        dispatch({ type: 'RECEIVE_ERROR' });
        return Promise.reject(error);
      });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject();
  },
  requestSettings: (): AppThunkAction<KnownAction> => (dispatch, getState): Promise<che.WorkspaceSettings> => {
    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = fetchSettings();
      promise
        .then(settings => {
          dispatch({ type: 'RECEIVE_SETTINGS', settings });
        })
        .catch(error => {
          dispatch({ type: 'RECEIVE_ERROR' });
          return Promise.reject(error);
        });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject(new Error('something went wrong with "Workspaces" state.'));
  },
  startWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<che.Workspace> => {
    const appState = getState();
    if (!appState || !appState.workspaces) {
      throw new Error('Cannot start a workspace. Application store is not ready yet.');
    }

    try {
      dispatch({ type: 'REQUEST_WORKSPACES' });
      const workspace = await startWorkspace(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
      return workspace;
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to start the workspace, ID: ${workspaceId}, ` + e);
    }
  },
  stopWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => (dispatch, getState): Promise<che.Workspace> => {
    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = stopWorkspace(workspaceId);
      promise.then(workspace => {
        if (workspace) {
          dispatch({ type: 'UPDATE_WORKSPACE', workspace });
        }
      }).catch(error => {
        dispatch({ type: 'RECEIVE_ERROR' });
        return Promise.reject(error);
      });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject();
  },
  deleteWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => (dispatch, getState): Promise<che.Workspace> => {
    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = deleteWorkspace(workspaceId);
      promise.then(() => {
        dispatch({ type: 'DELETE_WORKSPACE', workspaceId });
      }).catch(error => {
        dispatch({ type: 'RECEIVE_ERROR' });
        return Promise.reject(error);
      });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject();
  },
  updateWorkspace: (workspace: che.Workspace): AppThunkAction<KnownAction> => (dispatch, getState): Promise<che.Workspace> => {
    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = updateWorkspace(workspace);
      promise.then(workspace => {
        dispatch({ type: 'UPDATE_WORKSPACE', workspace });
      }).catch(error => {
        dispatch({ type: 'RECEIVE_ERROR' });
        return Promise.reject(error);
      });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject();
  },
  createWorkspaceFromDevfile: (
    devfile: che.WorkspaceDevfile,
    cheNamespace: string | undefined,
    infrastructureNamespace: string | undefined,
    attributes: { [key: string]: string } = {},
  ): AppThunkAction<KnownAction> => (dispatch, getState): Promise<che.Workspace> => {

    const appState = getState();
    if (appState && appState.workspaces) {

      // Lazy initialization of jsonRpcMasterApi
      if (!jsonRpcMasterApi) {
        // TODO change this test implementation to the real one
        const jsonRpcApiLocation = new URL(window.location.href).origin.replace('http', 'ws') + appState.branding.data.websocketContext;
        jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
      }

      const promise = createWorkspaceFromDevfile(
        devfile,
        cheNamespace,
        infrastructureNamespace,
        attributes);
      promise.then(workspace => {
        dispatch({ type: 'ADD_WORKSPACE', workspace });
        jsonRpcMasterApi.subscribeWorkspaceStatus(workspace.id as string, (message: any) => {
          const status = message.error ? 'ERROR' : message.status;
          if (WorkspaceStatus[status]) {
            workspace.status = status;
            dispatch({ type: 'UPDATE_WORKSPACE', workspace });
          }
        });
      })
        .catch(error => {
          dispatch({ type: 'RECEIVE_ERROR' });
          return Promise.reject(new Error(error));
        });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    // todo what kind of error?
    return Promise.reject(new Error('something went wrong with "Workspaces" state.'));
  },
};

const unloadedState: WorkspacesState = {
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
