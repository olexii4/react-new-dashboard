// This state defines the type of data maintained in the Redux store.
export interface UserState {
  user: che.User | {};
  isLogged: boolean;
}

export interface UserAction extends UserState {
  type: string;
}

export const actionCreators = {

};

export const setUser = (user: che.User | {}): UserAction => {
  return {
    type: 'SET_USER',
    user: user,
    isLogged: true
  }
};

const unloadedState: UserState = { user: { id: '', name: '', email: '' }, isLogged: false };

const userReducer = (state: UserState | undefined, action: UserAction): UserState => {
  if (state === undefined) {
    return unloadedState;
  }

  switch (action.type) {
    case 'SET_USER':
      return { user: action.user, isLogged: true };
  }

  return state;
};

export default userReducer;
