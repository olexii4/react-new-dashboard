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

import { IBranding } from '../services/bootstrap/CheBranding';

export interface BrandingState {
  branding: IBranding;
}

export interface BrandingAction extends BrandingState {
  type: 'SET_BRANDING' | string;
}

export const setBranding = (branding: IBranding): BrandingAction => {
  return {
    type: 'SET_BRANDING',
    branding: branding
  };
};

const unloadedState: BrandingState = { branding: {} };

const brandingReducer = (state: { branding: IBranding } | undefined = { branding: {} }, action: BrandingAction): BrandingState => {
  if (state === undefined) {
    return unloadedState;
  }

  switch (action.type) {
    case 'SET_BRANDING':
      return { branding: action.branding };
  }

  return state;
};

export default brandingReducer;
