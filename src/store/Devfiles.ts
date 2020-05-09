import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { fetchDevfile } from '../services/api/devfiles';

// This state defines the type of data maintained in the Redux store.
export interface DevfileState {
  [location: string]: {
    content: string;
    isLoading: boolean;
    error?: string;
  };
}

interface RequestDevfileAction {
  type: 'REQUEST_DEVFILE';
  location: string;
}

interface ReceiveDevfileAction {
  type: 'RECEIVE_DEVFILE';
  location: string;
  content: string;
}

interface ReceiveErrorAction {
  type: 'RECEIVE_ERROR';
  location: string;
  error: string;
}

type KnownAction = RequestDevfileAction
  | ReceiveDevfileAction
  | ReceiveErrorAction;

export type ActionCreators = {
  requestDevfile: (location: string) => any; // todo proper type instead of 'any'
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {
  requestDevfile: (location: string): AppThunkAction<KnownAction> => (dispatch, getState): Promise<string> => {
    const appState = getState();
    if (appState && appState.devfiles) {
      const promise = fetchDevfile(location)
        .then(devfile => {
          dispatch({
            type: 'RECEIVE_DEVFILE',
            content: devfile,
            location,
          });
          return devfile;
        })
        .catch((errorMsg: string) => {
          dispatch({
            type: 'RECEIVE_ERROR',
            error: errorMsg,
            location,
          });
          return Promise.reject(errorMsg);
        });
      dispatch({
        type: 'REQUEST_DEVFILE',
        location,
      });
      return promise;
    }
    // todo appState is not ready
    return Promise.reject();
  }
};

const unloadedState: DevfileState = { };

export const reducer: Reducer<DevfileState> = (state: DevfileState | undefined, incomingAction: Action): DevfileState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_DEVFILE':
      return Object.assign({}, state, {
        [action.location]: {
          isLoading: true,
          error: undefined,
          content: undefined,
        },
      });
    case 'RECEIVE_DEVFILE':
      return Object.assign({}, state, {
        [action.location]: {
          isLoading: false,
          content: action.content
        },
      });
    case 'RECEIVE_ERROR':
      return Object.assign({}, state, {
        [action.location]: {
          isLoading: false,
          error: action.error,
        },
      });
    default:
      return state;
  }

};
