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
import { fetchBranding } from '../services/assets/branding';
import { AppThunkAction, AppState } from '.';
import { BRANDING_DEFAULT, BrandingData } from '../services/bootstrap/branding.constant';

const ASSET_PREFIX = './assets/branding/';

export interface State {
  isLoading: boolean;
  data: BrandingData;
}

export interface RequestBrandingAction {
  isLoading: boolean;
  type: 'REQUEST_BRANDING';
}

export interface ReceivedBrandingAction {
  isLoading: boolean;
  type: 'RECEIVED_BRANDING';
  branding: BrandingData;
}

type KnownActions =
  RequestBrandingAction
  | ReceivedBrandingAction;

export type ActionCreators = {
  requestBranding: () => any;
};

export const actionCreators: ActionCreators = {

  requestBranding: (): AppThunkAction<KnownActions> =>
    async (dispatch, getState): Promise<any> => {
      const appState: AppState = getState();
      if (!appState || !appState.branding) {
        // todo throw a nice error
        throw Error('something unexpected happened.');
      }

      const url = `${ASSET_PREFIX}product.json?id=` + Math.floor((Math.random() * 100) + 1);

      dispatch({
        type: 'REQUEST_BRANDING',
        isLoading: true
      });

      try {
        const branding = await fetchBranding(url);

        // resolve asset paths
        const assetTitles: Array<keyof BrandingData> = ['logoFile', 'logoTextFile', 'favicon', 'loader'];
        assetTitles.forEach(asset => {
          const path = branding[asset] as string;
          if (path.startsWith(ASSET_PREFIX)) {
            return;
          }
          branding[asset] = ASSET_PREFIX + branding[asset];
        });

        dispatch({
          type: 'RECEIVED_BRANDING',
          isLoading: false,
          branding,
        });
        return branding;
      } catch (e) {
        throw new Error(`Failed to request branding data by URL: ${url}`);
      }
    },

};

const unloadedState: State = {
  isLoading: false,
  data: BRANDING_DEFAULT,
};

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownActions;
  switch (action.type) {
    case 'REQUEST_BRANDING':
      return Object.assign({}, state, {
        isLoading: true,
      });
    case 'RECEIVED_BRANDING':
      return Object.assign({}, state, {
        isLoading: false,
        branding: action.branding,
      });
    default:
      return state;
  }
};
