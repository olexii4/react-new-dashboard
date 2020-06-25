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

import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { NavMenu } from './NavMenu';
import Loader from '../app-common/loaders/Loader';

const NavMenuComponent = (props: { items: { to: string; label?: string }[]; children?: React.ReactNode }): React.ReactElement => {
  const state = useSelector((state: AppState) => state);
  if (!state.user.isLogged) {
    return <Loader />;
  }
  // TODO state.user.user.user => state.user.user
  return (
    <React.Fragment>
      <NavMenu user={state.user.user.user}
        logoURL={state.branding.data.logoFile}
        workspaces={state.workspaces.workspaces}
        items={props.items}>{props.children}</NavMenu>
    </React.Fragment>);
};

NavMenuComponent.displayName = 'NavMenuComponent';

export default NavMenuComponent;
