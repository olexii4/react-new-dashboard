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

import React from 'react';
import { Route } from 'react-router';

import { ROUTE } from './route.enum';

const GetStartedPage = React.lazy(() => import('./app-nav-menu/get-started/GetStartedPage'));
const WorkspacesList = React.lazy(() => import('./app-nav-menu/workspaces/WorkspacesList'));
const Administration = React.lazy(() => import('./app-nav-menu/administration/Administration'));
const WorkspaceDetails = React.lazy(() => import('./workspace-details/WorkspaceDetails'));
const IdeIframe = React.lazy(() => import('./ide-iframe/IdeIframe'));

export interface RouteItem {
  to: ROUTE;
  component: React.FunctionComponent<any>;
}

const items: RouteItem[] = [
  { to: ROUTE.GET_STARTED, component: GetStartedPage },
  { to: ROUTE.HOME, component: GetStartedPage },
  { to: ROUTE.WORKSPACES, component: WorkspacesList },
  { to: ROUTE.ADMINISTRATION, component: Administration },
  { to: ROUTE.WORKSPACE_DETAILS, component: WorkspaceDetails },
  { to: ROUTE.IDE, component: IdeIframe },
];

function Routes(): React.ReactElement {
  const routes = items.map(item => (
    <Route exact
      key={item.to}
      path={item.to}
      component={item.component}
    />
  ));
  return (
    <React.Fragment>
      {routes}
    </React.Fragment>
  );
}
Routes.displayName = 'RoutesComponent';
export default Routes;
