import * as Workspaces from './Workspaces';
import * as DevfilesMetadata from './DevfileMetadata';
import * as Devfiles from './Devfiles';
import * as DevfilesMetadataFilter from './DevfileFilters';
import brandingReducer from './Branding';
import userReducer from './User';

// the top-level state object
export interface AppState {
  workspaces: Workspaces.WorkspacesState;
  devfileMetadata: DevfilesMetadata.State;
  devfileMetadataFilter: DevfilesMetadataFilter.MetadataFilterState;
  devfiles: Devfiles.DevfileState;
  branding: any;
  user: any;
}

export const reducers = {
  workspaces: Workspaces.reducer,
  devfileMetadata: DevfilesMetadata.reducer,
  devfileMetadataFilter: DevfilesMetadataFilter.reducer,
  devfiles: Devfiles.reducer,
  branding: brandingReducer,
  user: userReducer,
};

// this type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => void, getState: () => AppState): void;
}
