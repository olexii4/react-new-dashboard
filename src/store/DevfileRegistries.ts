import { Action, Reducer } from 'redux';
import { AppThunkAction, AppState } from '.';
import { fetchRegistriesMetadata, fetchDevfile } from '../services/registry/devfiles';
import { fetchDevfileSchema } from '../services/api/devfile';

// This state defines the type of data maintained in the Redux store.
export interface State {
  isLoading: boolean;
  schema: any;
  metadata: che.DevfileMetaData[];
  devfiles: {
    [location: string]: {
      content: string;
      error: string;
    };
  };
}

interface RequestMetadataAction {
  type: 'REQUEST_METADATA';
}

interface ReceiveMetadataAction {
  type: 'RECEIVE_METADATA';
  metadata: che.DevfileMetaData[];
}

interface RequestDevfileAction {
  type: 'REQUEST_DEVFILE';
}

interface ReceiveDevfileAction {
  type: 'RECEIVE_DEVFILE';
  url: string;
  devfile: string;
}

interface RequestSchemaAction {
  type: 'REQUEST_SCHEMA';
}

interface ReceiveSchemaAction {
  type: 'RECEIVE_SCHEMA';
  schema: any;
}

type KnownAction = RequestMetadataAction
  | ReceiveMetadataAction
  | RequestDevfileAction
  | ReceiveDevfileAction
  | RequestSchemaAction
  | ReceiveSchemaAction;

// todo proper type instead of 'any'
export type ActionCreators = {
  requestRegistriesMetadata: (location: string) => any;
  requestDevfile: (Location: string) => any;
  requestJsonSchema: () => any;
};

// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators: ActionCreators = {

  /**
   * Request devfile metadata from available registries. `registryUrls` is space-separated list of urls.
   */
  requestRegistriesMetadata: (registryUrls: string): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<che.DevfileMetaData[]> => {
    const appState: AppState = getState();
    if (!appState || !appState.devfileRegistries) {
      // todo throw a nice error
      throw Error('something unexpected happened.');
    }

    dispatch({ type: 'REQUEST_METADATA' });

    try {
      const metadata = await fetchRegistriesMetadata(registryUrls);
      dispatch({ type: 'RECEIVE_METADATA', metadata });
      return metadata;
    } catch (e) {
      throw new Error(`Failed to request registries metadata from URLs: ${registryUrls}, \n` + e);
    }
  },

  requestDevfile: (url: string): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<string> => {
    const appState: AppState = getState();
    if (!appState || !appState.devfileRegistries) {
      // todo throw a nice error
      throw Error('something unexpected happened.');
    }

    dispatch({ type: 'REQUEST_DEVFILE' });

    try {
      const devfile = await fetchDevfile(url);
      dispatch({ type: 'RECEIVE_DEVFILE', devfile, url });
      return devfile;
    } catch (e) {
      throw new Error(`Failed to request a devfile from URL: ${url}, \n` + e);
    }
  },

  requestJsonSchema: (): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<any> => {
    const appState: AppState = getState();
    if (!appState || !appState.devfileRegistries) {
      // todo throw a nice error
      throw Error('something unexpected happened.');
    }

    dispatch({ type: 'REQUEST_SCHEMA' });

    try {
      const schema = await fetchDevfileSchema();
      dispatch({ type: 'RECEIVE_SCHEMA', schema });
      return schema;
    } catch (e) {
      throw new Error(`Failed to request devfile JSON schema, \n` + e);
    }
  },

};

const unloadedState: State = {
  isLoading: false,
  metadata: [],
  devfiles: {},
  schema: undefined,
};

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_METADATA':
    case 'REQUEST_SCHEMA':
    case 'REQUEST_DEVFILE':
      return Object.assign({}, state, {
        isLoading: true,
      });
    case 'RECEIVE_METADATA':
      return Object.assign({}, state, {
        metadata: action.metadata,
      });
    case 'RECEIVE_DEVFILE':
      return Object.assign({}, state, {
        devfiles: {
          [action.url]: {
            content: action.devfile,
          }
        }
      });
    case 'RECEIVE_SCHEMA':
      return Object.assign({}, state, {
        schema: action.schema
      });
    default:
      return state;
  }

};
