import { IBranding } from '../services/bootstrap/CheBranding'

export interface BrandingState {
  branding: IBranding;
}

export const setBranding = (branding: IBranding) => {
  return {
    type: 'SET_BRANDING',
    branding: branding
  }
};

const unloadedState: BrandingState = { branding: {} };

const brandingReducer = (state: { branding: IBranding } | undefined = { branding: {} }, action: { type: string; branding: IBranding }) => {
  if (state === undefined) {
    return unloadedState;
  }

  switch (action.type) {
    case 'SET_BRANDING':
      const branding = action.branding;
      return { branding };
  }

  return state;
};

export default brandingReducer;
