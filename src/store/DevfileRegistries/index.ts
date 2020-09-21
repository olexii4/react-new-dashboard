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
import { AppThunk } from '..';
import { fetchRegistriesMetadata, fetchDevfile } from '../../services/registry/devfiles';
import { fetchDevfileSchema } from '../../services/api/devfile';
import { createState } from '../helpers';

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

  // current filter
  filter: MetadataFilter;
}

export interface MetadataFilter {
  searchTokens: string[];
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

interface SetFilterValue extends Action {
  type: 'SET_FILTER',
  searchTokens: string[];
}

interface ClearFilterValue extends Action {
  type: 'CLEAR_FILTER',
}

type KnownAction = RequestMetadataAction
  | ReceiveMetadataAction
  | RequestDevfileAction
  | ReceiveDevfileAction
  | RequestSchemaAction
  | ReceiveSchemaAction
  | SetFilterValue
  | ClearFilterValue;

export type ActionCreators = {
  requestRegistriesMetadata: (location: string) => AppThunk<KnownAction, Promise<che.DevfileMetaData[]>>;
  requestDevfile: (Location: string) => AppThunk<KnownAction, Promise<string>>;
  requestJsonSchema: () => AppThunk<KnownAction, any>;

  setFilter: (value: string) => AppThunk<SetFilterValue, void>;
  clearFilter: () => AppThunk<ClearFilterValue, void>;
};

export const actionCreators: ActionCreators = {

  /**
   * Request devfile metadata from available registries. `registryUrls` is space-separated list of urls.
   */
  requestRegistriesMetadata: (registryUrls: string): AppThunk<KnownAction, Promise<che.DevfileMetaData[]>> => async (dispatch): Promise<che.DevfileMetaData[]> => {
    dispatch({ type: 'REQUEST_METADATA' });
    try {
      const metadata = await fetchRegistriesMetadata(registryUrls);
      dispatch({ type: 'RECEIVE_METADATA', metadata });
      return metadata;
    } catch (e) {
      throw new Error(`Failed to request registries metadata from URLs: ${registryUrls}, \n` + e);
    }
  },

  requestDevfile: (url: string): AppThunk<KnownAction, Promise<string>> => async (dispatch): Promise<string> => {
    dispatch({ type: 'REQUEST_DEVFILE' });
    try {
      const devfile = await fetchDevfile(url);
      dispatch({ type: 'RECEIVE_DEVFILE', devfile, url });
      return devfile;
    } catch (e) {
      throw new Error(`Failed to request a devfile from URL: ${url}, \n` + e);
    }
  },

  requestJsonSchema: (): AppThunk<KnownAction, any> => async (dispatch): Promise<any> => {
    dispatch({ type: 'REQUEST_SCHEMA' });
    try {
      const schema = await fetchDevfileSchema();
      dispatch({ type: 'RECEIVE_SCHEMA', schema });
      return schema;
    } catch (e) {
      throw new Error('Failed to request devfile JSON schema, \n' + e);
    }
  },

  setFilter: (value: string): AppThunk<SetFilterValue, void> => dispatch => {
    const searchTokens = value.toLowerCase().split(/\s+/);
    dispatch({ type: 'SET_FILTER', searchTokens });
  },

  clearFilter: (): AppThunk<ClearFilterValue, void> => dispatch => {
    dispatch({ type: 'CLEAR_FILTER' });
  }

};

const unloadedState: State = {
  isLoading: false,
  metadata: [],
  devfiles: {},
  schema: undefined,

  filter: { searchTokens: [] },
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
      return createState(state, {
        isLoading: true,
      });
    case 'RECEIVE_METADATA':
      return createState(state, {
        isLoading: false,
        metadata: action.metadata,
      });
    case 'RECEIVE_DEVFILE':
      return createState(state, {
        isLoading: false,
        devfiles: {
          [action.url]: {
            content: action.devfile,
          }
        }
      });
    case 'RECEIVE_SCHEMA':
      return createState(state, {
        isLoading: false,
        schema: action.schema,
      });
    case 'SET_FILTER': {
      return createState(state, {
        filter: {
          searchTokens: action.searchTokens,
        },
      });
    }
    case 'CLEAR_FILTER': {
      return createState(state, {
        filter: {
          searchTokens: [],
        },
      });
    }
    default:
      return state;
  }

};
