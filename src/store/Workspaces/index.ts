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
import * as api from '@eclipse-che/api';
import { ThunkDispatch } from 'redux-thunk';
import { AppThunk } from '../';
import {
  createWorkspaceFromDevfile,
} from '../../services/api/workspace';
import { container } from '../../inversify.config';
import { CheWorkspaceClient } from '../../services/workspace-client/CheWorkspaceClient';
import { WorkspaceStatus } from '../../services/api/workspaceStatus';
import { createState } from '../helpers';

const WorkspaceClient = container.get(CheWorkspaceClient);

// This state defines the type of data maintained in the Redux store.
export interface State {
  isLoading: boolean;
  settings: che.WorkspaceSettings;
  workspaces: che.Workspace[];

  // current workspace qualified name
  namespace: string;
  workspaceName: string;
  workspaceId: string;

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

interface UpdateWorkspaceStatusAction extends Action {
  type: 'UPDATE_WORKSPACE_STATUS';
  workspaceId: string;
  status: string;
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

interface SetWorkspaceQualifiedName {
  type: 'SET_WORKSPACE_NAME';
  namespace: string;
  workspaceName: string;
}

interface ClearWorkspaceQualifiedName {
  type: 'CLEAR_WORKSPACE_NAME';
}

interface SetWorkspaceId {
  type: 'SET_WORKSPACE_ID';
  workspaceId: string;
}

interface ClearWorkspaceId {
  type: 'CLEAR_WORKSPACE_ID';
}

type KnownAction =
  RequestWorkspacesAction
  | ReceiveErrorAction
  | ReceiveWorkspacesAction
  | UpdateWorkspaceAction
  | DeleteWorkspaceAction
  | AddWorkspaceAction
  | ReceiveSettingsAction
  | SetWorkspaceQualifiedName
  | ClearWorkspaceQualifiedName
  | SetWorkspaceId
  | ClearWorkspaceId
  | UpdateWorkspaceStatusAction;

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

  setWorkspaceQualifiedName: (namespace: string, workspaceName: string) => AppThunk<SetWorkspaceQualifiedName>;
  clearWorkspaceQualifiedName: () => AppThunk<ClearWorkspaceQualifiedName>;
  setWorkspaceId: (workspaceId: string) => AppThunk<SetWorkspaceId>;
  clearWorkspaceId: () => AppThunk<ClearWorkspaceId>;
};

type MessageHandler = (message: any) => void;
const subscribedWorkspaceStatusCallbacks = new Map<string, MessageHandler>();

function subscribeToStatusChange(workspaceId: string, dispatch: ThunkDispatch<State, undefined, UpdateWorkspaceStatusAction>): void {
  const callback = (message: any) => {
    const status = message.error ? 'ERROR' : message.status;
    if (WorkspaceStatus[status]) {
      dispatch({
        type: 'UPDATE_WORKSPACE_STATUS',
        workspaceId,
        status,
      });
    }
  };
  WorkspaceClient.jsonRpcMasterApi.subscribeWorkspaceStatus(workspaceId, callback);
  subscribedWorkspaceStatusCallbacks.set(workspaceId, callback);
}
function unSubscribeToStatusChange(workspaceId: string): void {
  const callback = subscribedWorkspaceStatusCallbacks.get(workspaceId);
  if (!callback) {
    return;
  }
  WorkspaceClient.jsonRpcMasterApi.unSubscribeWorkspaceStatus(workspaceId, callback);
  subscribedWorkspaceStatusCallbacks.delete(workspaceId);
}

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  requestWorkspaces: (): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const workspaces = await WorkspaceClient.restApiClient.getAll<che.Workspace>();

      // Unsubscribe
      subscribedWorkspaceStatusCallbacks.forEach((workspaceStatusCallback: MessageHandler, workspaceId: string) => {
        unSubscribeToStatusChange(workspaceId);
      });

      // Subscribe
      workspaces.forEach(workspace => {
        subscribeToStatusChange(workspace.id, dispatch);
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
      const settings = await WorkspaceClient.restApiClient.getSettings<che.WorkspaceSettings>();
      dispatch({ type: 'RECEIVE_SETTINGS', settings });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to fetch settings, \n' + e);
    }
  },

  startWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    try {
      const workspace = await WorkspaceClient.restApiClient.start(workspaceId);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to start the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  stopWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    try {
      await WorkspaceClient.restApiClient.stop(workspaceId);
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to stop the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  deleteWorkspace: (workspaceId: string): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    try {
      await WorkspaceClient.restApiClient.delete(workspaceId);
      dispatch({ type: 'DELETE_WORKSPACE', workspaceId });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error(`Failed to delete the workspace, ID: ${workspaceId}, ` + e);
    }
  },

  updateWorkspace: (workspace: che.Workspace): AppThunk<KnownAction, Promise<void>> => async (dispatch): Promise<void> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });

    try {
      const updatedWorkspace = await WorkspaceClient.restApiClient.update(workspace.id, workspace as api.che.workspace.Workspace);
      dispatch({ type: 'UPDATE_WORKSPACE', workspace: updatedWorkspace });
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      const message = e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message;
      throw new Error(`Failed to update. ${message}`);
    }
  },

  createWorkspaceFromDevfile: (
    devfile: che.WorkspaceDevfile,
    cheNamespace: string | undefined,
    infrastructureNamespace: string | undefined,
    attributes: { [key: string]: string } = {},
  ): AppThunk<KnownAction, Promise<che.Workspace>> => async (dispatch): Promise<che.Workspace> => {
    dispatch({ type: 'REQUEST_WORKSPACES' });
    try {
      const workspace = await createWorkspaceFromDevfile(
        devfile,
        cheNamespace,
        infrastructureNamespace,
        attributes
      );
      dispatch({ type: 'ADD_WORKSPACE', workspace });
      // Subscribe
      subscribeToStatusChange(workspace.id, dispatch);

      return workspace;
    } catch (e) {
      dispatch({ type: 'RECEIVE_ERROR' });
      throw new Error('Failed to create a new workspace from the devfile: \n' + e);
    }
  },

  setWorkspaceQualifiedName: (namespace: string, workspaceName: string): AppThunk<SetWorkspaceQualifiedName> => dispatch => {
    dispatch({
      type: 'SET_WORKSPACE_NAME',
      namespace,
      workspaceName,
    });
  },

  clearWorkspaceQualifiedName: (): AppThunk<ClearWorkspaceQualifiedName> => dispatch => {
    dispatch({ type: 'CLEAR_WORKSPACE_NAME' });
  },

  setWorkspaceId: (workspaceId: string): AppThunk<SetWorkspaceId> => dispatch => {
    dispatch({
      type: 'SET_WORKSPACE_ID',
      workspaceId,
    });
  },

  clearWorkspaceId: (): AppThunk<ClearWorkspaceId> => dispatch => {
    dispatch({ type: 'CLEAR_WORKSPACE_ID' });
  }

};

const unloadedState: State = {
  workspaces: [],
  settings: {} as che.WorkspaceSettings,
  isLoading: false,

  namespace: '',
  workspaceName: '',
  workspaceId: '',

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
      return createState(state, {
        isLoading: true,
      });
    case 'RECEIVE_ERROR':
      return createState(state, {
        isLoading: false,
      });
    case 'UPDATE_WORKSPACE':
      return createState(state, {
        isLoading: false,
        workspaces: state.workspaces.map(workspace => workspace.id === action.workspace.id ? action.workspace : workspace),
      });
    case 'UPDATE_WORKSPACE_STATUS':
      return createState(state, {
        workspaces: state.workspaces.map(workspace => {
          if (workspace.id === action.workspaceId) {
            workspace.status = action.status;
          }
          return workspace;
        })
      });
    case 'ADD_WORKSPACE':
      return createState(state, {
        workspaces: state.workspaces.concat([action.workspace]),
      });
    case 'DELETE_WORKSPACE':
      return createState(state, {
        isLoading: false,
        workspaces: state.workspaces.filter(workspace => workspace.id !== action.workspaceId),
      });
    case 'RECEIVE_WORKSPACES':
      return createState(state, {
        isLoading: false,
        workspaces: action.workspaces,
      });
    case 'RECEIVE_SETTINGS':
      return createState(state, {
        isLoading: false,
        settings: action.settings,
      });
    case 'SET_WORKSPACE_NAME':
      return createState(state, {
        namespace: action.namespace,
        workspaceName: action.workspaceName,
      });
    case 'CLEAR_WORKSPACE_NAME':
      return createState(state, {
        namespace: '',
        workspaceName: '',
      });
    case 'SET_WORKSPACE_ID':
      return createState(state, {
        workspaceId: action.workspaceId,
      });
    case 'CLEAR_WORKSPACE_ID':
      return createState(state, {
        workspaceId: '',
      });
    default:
      return state;
  }

};
