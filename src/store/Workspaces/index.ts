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

import { Reducer } from 'redux';
import { AppThunk } from '../';
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

  // current workspace qualified name
  namespace: string;
  workspaceName: string;

  // number of recent workspaces
  recentNumber: number;
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
  requestWorkspaces: () => AppThunk<KnownAction, Promise<void>>;
  startWorkspace: (workspaceId: string) => AppThunk<KnownAction, Promise<void>>;
  stopWorkspace: (workspaceId: string) => AppThunk<KnownAction, Promise<void>>;
  deleteWorkspace: (workspaceId: string) => AppThunk<KnownAction, Promise<void>>;
  updateWorkspace: (workspace: che.Workspace) => AppThunk<KnownAction, Promise<void>>;
  createWorkspaceFromDevfile: (
    devfile: che.WorkspaceDevfile,
    cheNamespace: string | undefined,
    infrastructureNamespace: string | undefined,
    attributes: { [key: string]: string },
  ) => AppThunk<KnownAction, Promise<che.Workspace>>;
  requestSettings: () => AppThunk<KnownAction, Promise<void>>;

  storeWorkspaceQualifiedName: (namespace: string, workspaceName: string) => AppThunk<StoreWorkspaceQualifiedName>;
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  requestWorkspaces: (): AppThunk<KnownAction, Promise<void>> => async (dispatch, getState): Promise<void> => {
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

  requestSettings: (): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const settings = await fetchSettings();
      dispatch({ type: 'RECEIVE_SETTINGS', settings });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to fetch settings, \n' + e);
    }
  },

  startWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspace = await startWorkspace(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to start the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  stopWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspace = await stopWorkspace(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to stop the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  deleteWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      await deleteWorkspace(workspaceId);
      dispatch({ type: 'DELETE_WORKSPACE', workspaceId });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to delete the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  updateWorkspace: (workspace: che.Workspace): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
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
  ): AppThunk<KnownAction, Promise<che.Workspace>> => async (dispatch, getState): Promise<che.Workspace> => {

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

      return workspace;
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to create a new workspace from the devfile: \n' + e);
    }
  },

  storeWorkspaceQualifiedName: (namespace: string, workspaceName: string): AppThunk<KnownAction> => (dispatch): void => {
    dispatch({
      type: 'STORE_WORKSPACE_NAME',
      namespace,
      workspaceName,
    });
  },

};

const unloadedState: State = {
  workspaces: [],
  settings: {} as che.WorkspaceSettings,
  isLoading: false,

  namespace: '',
  workspaceName: '',

  recentNumber: 5,
};

type StatePartial = {
  [key in keyof State]: State[key];
};

export const reducer: Reducer<State> = (state: State | undefined, action: KnownAction): State => {
  if (state === undefined) {
    return unloadedState;
  }

  switch (action.type) {
    case 'REQUEST_WORKSPACES':
      return Object.assign(
        {},
        state,
        { isLoading: true, } as StatePartial,
      );
    case 'RECEIVE_ERROR':
      return Object.assign(
        {},
        state,
        { isLoading: false, } as StatePartial
      );
    case 'UPDATE_WORKSPACE':
      return Object.assign(
        {},
        state,
        {
          isLoading: false,
          workspaces: state.workspaces.map(workspace => workspace.id === action.workspace.id ? action.workspace : workspace),
        } as StatePartial
      );
    case 'ADD_WORKSPACE':
      return Object.assign(
        {},
        state,
        {
          workspaces: state.workspaces.concat([action.workspace]),
        } as StatePartial,
      );
    case 'DELETE_WORKSPACE':
      return Object.assign(
        {},
        state,
        {
          isLoading: false,
          workspaces: state.workspaces.filter(workspace => workspace.id !== action.workspaceId),
        } as StatePartial,
      );
    case 'RECEIVE_WORKSPACES':
      return Object.assign(
        {},
        state,
        {
          isLoading: false,
          workspaces: action.workspaces,
        } as StatePartial,
      );
    case 'RECEIVE_SETTINGS':
      return Object.assign(
        {},
        state,
        {
          isLoading: false,
          settings: action.settings,
        } as StatePartial,
      );
    default:
      return state;
  }

};
