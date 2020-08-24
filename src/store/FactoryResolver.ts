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
import { AppThunkAction, AppState } from './';
import { fetchFactoryResolver } from '../services/api/factory-resolver';

export interface State {
  isLoading: boolean;
  resolver: { location?: string; devfile?: che.WorkspaceDevfile; }
}

interface RequestFactoryResolverAction {
  type: 'REQUEST_FACTORY_RESOLVER';
}

interface ReceiveFactoryResolverAction {
  type: 'RECEIVE_FACTORY_RESOLVER';
  resolver: { location?: string; devfile?: che.WorkspaceDevfile; }
}

type KnownAction = RequestFactoryResolverAction
  | ReceiveFactoryResolverAction;

// todo proper type instead of 'any'
export type ActionCreators = {
  requestFactoryResolver: (location: string) => any;
};

export const actionCreators: ActionCreators = {

  requestFactoryResolver: (location: string): AppThunkAction<KnownAction> => async (dispatch, getState): Promise<che.WorkspaceDevfile> => {
    const appState: AppState = getState();
    if (!appState || !appState.infrastructureNamespace) {
      // todo throw a nice error
      throw Error('something unexpected happened');
    }

    dispatch({ type: 'REQUEST_FACTORY_RESOLVER' });

    try {
      const devfile: che.WorkspaceDevfile = await fetchFactoryResolver(location);
      dispatch({ type: 'RECEIVE_FACTORY_RESOLVER', resolver: { location: location, devfile: devfile } });
      return devfile;
    } catch (e) {
      throw new Error('Failed to request factory resolver, \n' + e);
    }
  },

};

const unloadedState: State = {
  isLoading: false,
  resolver: {}
};

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  switch (action.type) {
    case 'REQUEST_FACTORY_RESOLVER':
      return Object.assign({}, state, {
        isLoading: true,
      });
    case 'RECEIVE_FACTORY_RESOLVER':
      return Object.assign({}, state, {
        plugins: action.resolver,
      });
    default:
      return state;
  }
};
