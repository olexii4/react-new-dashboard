import { Action, Reducer } from 'redux';
import { AppThunkAction, AppState } from '.';
import { fetchMetadata } from '../services/api/devfileMetadata';

// This state defines the type of data maintained in the Redux store.
export interface State {
  isLoading: boolean;
  metadata: che.DevfileMetaData[];
}

interface RequestDevfilesAction {
  type: 'REQUEST_METADATA';
}

interface ReceiveDevfilesAction {
  type: 'RECEIVE_METADATA';
  metadata: che.DevfileMetaData[];
}

type KnownAction = RequestDevfilesAction
  | ReceiveDevfilesAction;

// todo proper type instead of 'any'
export type ActionCreators = {
  requestMetadata: (location: string) => any;
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  /**
   * Request devfile metadata from repositories. `registryUrls` is space-separated list of urls.
   */
  requestMetadata: (registryUrls: string): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<che.DevfileMetaData[]> => {
    const appState: AppState = getState();
    if (!appState || !appState.devfileMetadata) {
      // todo throw a nice error
      throw Error('something unexpected happened.');
    }

    dispatch({ type: 'REQUEST_METADATA' });

    const metadata = await fetchMetadata(registryUrls);
    dispatch({ type: 'RECEIVE_METADATA', metadata });
    return metadata;
  },

};

const unloadedState: State = { metadata: [], isLoading: false };

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_METADATA':
      return {
        metadata: state.metadata,
        isLoading: true,
      };
    case 'RECEIVE_METADATA':
      if (action) {
        return {
          metadata: action.metadata,
          isLoading: true,
        };
      }
    default:
      return state;
  }

};
