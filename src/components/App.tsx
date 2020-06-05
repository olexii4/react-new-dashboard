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

import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { ConnectedRouter as Router } from 'connected-react-router';
import Layout from './app-nav-menu/Layout';

import './app.styl';

type RouteItem = {
  to: string;
  component: React.ComponentClass<any, any> | React.FunctionComponent<any>;
  label?: string;
  ico?: string;
};

// todo improve fallback
const fallback = <div>loading....</div>;
const GetStartedPage = React.lazy(() => import('./app-nav-menu/get-started/GetStartedPage'));
const WorkspacesList = React.lazy(() => import('./app-nav-menu/workspaces/WorkspacesList'));
const Administration = React.lazy(() => import('./app-nav-menu/administration/Administration'));
const WorkspaceDetails = React.lazy(() => import('./workspace-details/WorkspaceDetails'));
const IdeIframe = React.lazy(() => import('./ide-iframe/IdeIframe'));

const items: RouteItem[] = [
  { to: '/', component: GetStartedPage, label: 'Get Started Page', ico: 'fa fa-plus' },
  { to: '/workspaces', component: WorkspacesList, label: 'Workspaces', ico: 'chefont cheico-workspace' },
  { to: '/administration', component: Administration, label: 'Administration', ico: 'material-design icon-ic_settings_24px' },
  { to: '/workspace/:namespace/:workspaceName/', component: WorkspaceDetails },
  { to: '/ide/:namespace/:workspaceName/', component: IdeIframe },
];

const LayoutComponent = (props: { history: any }): React.ReactElement => {
  const navItems = items.map(item => ({ to: item.to, label: item.label, ico: item.ico }));
  const routes = items.map((item: RouteItem, index: number) => (
    <Route key={`app_route_${index + 1}`} path={item.to} exact component={item.component} />
  ));

  return (
    <Router history={props.history}>
      <Layout items={navItems}>
        <Switch>
          <Suspense fallback={fallback}>
            {routes}
            <Redirect path='*' to='/' />
          </Suspense>
        </Switch>
      </Layout>
    </Router>
  );
};

LayoutComponent.displayName = 'LayoutComponent';

export default LayoutComponent;
