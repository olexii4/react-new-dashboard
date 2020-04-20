import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import {
  createWorkspace,
  deleteWorkspace,
  fetchWorkspaces,
  startWorkspace,
  stopWorkspace,
  updateWorkspace
} from '../services/api/workspaces';
import { container } from '../inversify.config';
import { CheJsonRpcApi } from '../services/json-rpc/JsonRpcApiFactory';
import { CheBranding } from '../services/bootstrap/CheBranding';
import { JsonRpcMasterApi } from '../services/json-rpc/JsonRpcMasterApi';

// This state defines the type of data maintained in the Redux store.
export interface WorkspacesState {
  isLoading: boolean;
  workspaces: che.IWorkspace[];
}

interface RequestWorkspacesAction {
  type: 'REQUEST_WORKSPACES';
}

interface ReceiveErrorAction {
  type: 'RECEIVE_ERROR';
}

interface ReceiveWorkspacesAction {
  type: 'RECEIVE_WORKSPACES';
  workspaces: che.IWorkspace[];
}

interface UpdateWorkspaceAction {
  type: 'UPDATE_WORKSPACE';
  workspace: che.IWorkspace;
}

interface DeleteWorkspaceAction {
  type: 'DELETE_WORKSPACE';
  workspaceId: string;
}

interface AddWorkspaceAction {
  type: 'ADD_WORKSPACE';
  workspace: che.IWorkspace;
}

type KnownAction =
  RequestWorkspacesAction
  | ReceiveErrorAction
  | ReceiveWorkspacesAction
  | UpdateWorkspaceAction
  | DeleteWorkspaceAction
  | AddWorkspaceAction;

export enum WorkspaceStatus { RUNNING = 1, STOPPED, PAUSED, STARTING, STOPPING, ERROR }

const cheJsonRpcApi = container.get(CheJsonRpcApi);
const cheBranding = container.get(CheBranding);
let jsonRpcMasterApi: JsonRpcMasterApi;

// TODO change this test implementation to the real one
const jsonRpcApiLocation = new URL(window.location.href).origin.replace('http', 'ws') + cheBranding.all.websocketContext;

export type IActionCreators = {
  requestWorkspaces: () => any;
  startWorkspace: (workspaceId: string) => any;
  stopWorkspace: (workspaceId: string) => any;
  deleteWorkspace: (workspaceId: string) => any;
  updateWorkspace: (workspace: che.IWorkspace) => any;
  createWorkspace: (devfileUrl: string, attributes: { [param: string]: string }) => any;
}
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: IActionCreators = {

  requestWorkspaces: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    // Lazy initialization of jsonRpcMasterApi
    if (!jsonRpcMasterApi) {
      jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
    }
    const appState = getState();
    if (appState && appState.workspaces) {
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
  startWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = startWorkspace(workspaceId);
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
  stopWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
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
  deleteWorkspace: (workspaceId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
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
  updateWorkspace: (workspace: che.IWorkspace): AppThunkAction<KnownAction> => (dispatch, getState) => {
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
  createWorkspace: (devfileUrl: string, attr: { [param: string]: string }): AppThunkAction<KnownAction> => (dispatch, getState) => {
    // Lazy initialization of jsonRpcMasterApi
    if (!jsonRpcMasterApi) {
      jsonRpcMasterApi = cheJsonRpcApi.getJsonRpcMasterApi(jsonRpcApiLocation);
    }

    const appState = getState();
    if (appState && appState.workspaces) {
      const promise = createWorkspace(devfileUrl, attr);
      promise.then((workspace: any) => {
        if (workspace) {
          dispatch({ type: 'ADD_WORKSPACE', workspace });
          jsonRpcMasterApi.subscribeWorkspaceStatus(workspace.id as string, (message: any) => {
            const status = message.error ? 'ERROR' : message.status;
            if (WorkspaceStatus[status]) {
              workspace.status = status;
              dispatch({ type: 'UPDATE_WORKSPACE', workspace });
            }
          });
        }
      }).catch(error => {
        dispatch({ type: 'RECEIVE_ERROR' });
        return Promise.reject(error);
      });
      dispatch({ type: 'REQUEST_WORKSPACES' });
      return promise;
    }
    return Promise.reject();
  }
};

const unloadedState: WorkspacesState = { workspaces: [], isLoading: false };

export const reducer: Reducer<WorkspacesState> = (state: WorkspacesState | undefined, incomingAction: Action): WorkspacesState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_WORKSPACES':
      return {
        workspaces: state.workspaces,
        isLoading: true
      };
    case 'RECEIVE_ERROR':
      return {
        workspaces: state.workspaces,
        isLoading: false
      };
    case 'UPDATE_WORKSPACE':
      return {
        workspaces: state.workspaces.map((workspace: che.IWorkspace) => {
          return workspace.id === action.workspace.id ? action.workspace : workspace;
        }),
        isLoading: false
      };
    case 'ADD_WORKSPACE':
      return {
        workspaces: state.workspaces.concat([action.workspace]),
        isLoading: false
      };
    case 'DELETE_WORKSPACE':
      return {
        workspaces: state.workspaces.filter(workspace => workspace.id !== action.workspaceId),
        isLoading: false
      };
    case 'RECEIVE_WORKSPACES':
      if (action) {
        return {
          workspaces: action.workspaces,
          isLoading: false
        };
      }
      break;
  }

  return state;
};
