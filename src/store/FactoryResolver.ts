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
import { FactoryResolver } from '../services/types';
import { AppState, AppThunk } from './';
import { container } from '../inversify.config';
import { CheWorkspaceClient } from '../services/workspace-client/CheWorkspaceClient';

const WorkspaceClient = container.get(CheWorkspaceClient);

export interface State {
  isLoading: boolean;
  resolver: {
    location?: string;
    source?: string;
    devfile?: api.che.workspace.devfile.Devfile;
  }
}

interface RequestFactoryResolverAction {
  type: 'REQUEST_FACTORY_RESOLVER';
}

interface ReceiveFactoryResolverAction {
  type: 'RECEIVE_FACTORY_RESOLVER';
  resolver: { location?: string; devfile?: api.che.workspace.devfile.Devfile; }
}

type KnownAction = RequestFactoryResolverAction
  | ReceiveFactoryResolverAction;

// todo proper type instead of 'any'
export type ActionCreators = {
  requestFactoryResolver: (location: string) => AppThunk<KnownAction, Promise<void>>;
};

export const actionCreators: ActionCreators = {
  requestFactoryResolver: (location: string): AppThunk<KnownAction, Promise<void>> => async (dispatch, getState): Promise<void> => {
    const appState: AppState = getState();
    if (!appState || !appState.infrastructureNamespace) {
      // todo throw a nice error
      throw Error('something unexpected happened');
    }

    dispatch({ type: 'REQUEST_FACTORY_RESOLVER' });

    try {
      const data = await WorkspaceClient.restApiClient.getFactoryResolver<FactoryResolver>(location);
      if (!data.devfile) {
        throw new Error('The specified link does not contain a valid Devfile.');
      }
      dispatch({ type: 'RECEIVE_FACTORY_RESOLVER', resolver: { location: location, devfile: data.devfile, source: data.source } });
      return;
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
        resolver: action.resolver,
      });
    default:
      return state;
  }
};
