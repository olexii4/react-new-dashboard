import { Reducer, Action } from 'redux';
import { AppThunkAction, AppState } from './index';

export interface MetadataFilterState {
  filter: MetadataFilter | undefined;
  found: che.DevfileMetaData[];
}

export interface MetadataFilter {
  search: string | undefined;
}
interface ShowFilteredAction {
  type: 'SHOW_FILTERED';
  filter: MetadataFilter;
  found: che.DevfileMetaData[];
}

interface ShowAllAction {
  type: 'SHOW_ALL';
  filter: MetadataFilter;
  found: che.DevfileMetaData[];
}

type KnownAction = ShowAllAction
  | ShowFilteredAction;

// todo proper type instead of 'any'
export type ActionCreators = {
  showAll: () => any;
  setFilter: (searchValue: string) => any;
}

export const actionCreators: ActionCreators = {

  showAll: (): AppThunkAction<KnownAction> =>
    (dispatch, getState): MetadataFilter => {
      const appState: AppState = getState();
      if (!appState || !appState.devfileMetadata) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      const found = appState.devfileMetadata.metadata;
      const filter: MetadataFilter = { search: undefined };

      dispatch({
        type: 'SHOW_ALL',
        filter,
        found,
      });

      return filter;
    },

  /**
   * `searchValue` is space-separated list of tokens
   */
  setFilter: (searchValue: string): AppThunkAction<KnownAction> =>
    (dispatch, getState): MetadataFilter => {
      const appState: AppState = getState();
      if (!appState || !appState.devfileMetadata) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      const allMetadata = appState.devfileMetadata.metadata;
      const filter = {
        search: searchValue,
      };

      if (searchValue === '') {
        dispatch({
          type: 'SHOW_ALL',
          filter,
          found: allMetadata,
        });

        return filter;
      }

      const searchTokens = searchValue.toLowerCase().split(/\s+/);
      const matches = (meta: che.DevfileMetaData, values: string[]): boolean => {
        return values.every(value =>
          meta.displayName.toLowerCase().split(/\s+/).some(word => word.startsWith(value))
          || meta.description?.toLowerCase().split(/\s+/).some(word => word.startsWith(value))
        );
      }

      const found = allMetadata.filter(devfile => matches(devfile, searchTokens));
      dispatch({
        type: 'SHOW_FILTERED',
        filter,
        found,
      })

      return filter;
    }
};

const unloadedState: MetadataFilterState = {
  filter: { search: undefined },
  found: [],
};

export const reducer: Reducer<MetadataFilterState> = (state: MetadataFilterState | undefined, incomingAction: Action): MetadataFilterState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'SHOW_FILTERED':
    case 'SHOW_ALL':
      return Object.assign({}, state, {
        filter: action.filter,
        found: action.found,
      });
    default:
      return state;
  }
};
