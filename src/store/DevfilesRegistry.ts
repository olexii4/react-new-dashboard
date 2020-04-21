import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { fetchDevfiles } from '../services/api/devfiles-registry';

// This state defines the type of data maintained in the Redux store.
export interface DevfilesState {
  isLoading: boolean;
  data: { devfiles: che.DevfileMetaData[]; registryUrl: string; jsonSchema?: any }[];
}

interface RequestDevfilesAction {
  type: 'REQUEST_DEVFILES';
}

interface ReceiveDevfilesAction {
  type: 'RECEIVE_DEVFILES';
  data: { devfiles: che.DevfileMetaData[]; registryUrl: string }[];
}

type KnownAction = RequestDevfilesAction | ReceiveDevfilesAction;

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators = {
  requestDevfiles: (): AppThunkAction<KnownAction> => (dispatch, getState): void => {
    const appState = getState();
    if (appState && appState.devfilesRegistry) {
      fetchDevfiles()
        .then(res => {
          dispatch({ type: 'RECEIVE_DEVFILES', data: [res] });
        });
      dispatch({ type: 'REQUEST_DEVFILES' });
    }
  }
};

const unloadedState: DevfilesState = { data: [], isLoading: false };

export const reducer: Reducer<DevfilesState> = (state: DevfilesState | undefined, incomingAction: Action): DevfilesState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_DEVFILES':
      return {
        data: state.data,
        isLoading: true
      };
    case 'RECEIVE_DEVFILES':
      if (action) {
        return {
          data: action.data,
          isLoading: false
        };
      }
      break;
  }

  return state;
};
