import * as Workspaces from './Workspaces';
import * as DevfilesRegistry from './DevfilesRegistry';
import brandingReducer from './Branding';
import userReducer from './User';

// the top-level state object
export interface AppState {
  workspaces: Workspaces.WorkspacesState;
  devfilesRegistry: DevfilesRegistry.DevfilesState;
  branding: any;
  user: any;
}

export const reducers = {
  workspaces: Workspaces.reducer,
  devfilesRegistry: DevfilesRegistry.reducer,
  branding: brandingReducer,
  user: userReducer
};

// this type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => void, getState: () => AppState): void;
}
