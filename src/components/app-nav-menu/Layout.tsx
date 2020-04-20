import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { NavMenu } from './NavMenu';
import Loader from '../app-common/loaders/Loader';

export default (props: { items: { to: string; label?: string }[]; children?: React.ReactNode }) => {
  const state = useSelector((state: AppState) => state);
  if (!state.user.isLogged) {
    return <Loader />;
  }
  // TODO state.user.user.user => state.user.user
  return (
    <React.Fragment>
      <NavMenu user={state.user.user.user}
        logoURL={state.branding.branding.branding.logoURL}
        workspaces={state.workspaces.workspaces}
        creationLink={state.branding.branding.branding.workspace.creationLink}
        items={props.items}
        children={props.children} />
    </React.Fragment>);
};
