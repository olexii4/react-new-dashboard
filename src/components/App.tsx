import React from 'react';
import { Redirect, Route } from 'react-router';
import { ConnectedRouter as Router } from 'connected-react-router';
import Layout from './app-nav-menu/Layout';
import loadable from 'react-loadable';

import './app.styl';

type Item = {
  to: string;
  component: React.ComponentClass<any, any> | React.FunctionComponent<any>;
  label?: string;
  ico?: string;
};

const fallback = <div>loading....</div>;
const GetStartedPageLoadable = loadable({
  loader: () => import('./app-nav-menu/get-started/GetStartedPage'),
  loading: () => fallback,
});
const WorkspacesListLoadable = loadable({
  loader: () => import('./app-nav-menu/workspaces/WorkspacesList'),
  loading: () => fallback,
});
const AdministrationLoadable = loadable({
  loader: () => import('./app-nav-menu/administration/Administration'),
  loading: () => fallback,
});
const WorkspaceDetailsLoadable = loadable({
  loader: () => import('./workspace-details/WorkspaceDetails'),
  loading: () => fallback,
});
const IdeIframeLoadable = loadable({
  loader: () => import('./ide-iframe/IdeIframe'),
  loading: () => fallback,
});

const items: Item[] = [
  { to: '/', component: GetStartedPageLoadable, label: 'Get Started Page', ico: 'fa fa-plus' },
  { to: '/workspaces', component: WorkspacesListLoadable, label: 'Workspaces', ico: 'chefont cheico-workspace' },
  { to: '/administration', component: AdministrationLoadable, label: 'Administration', ico: 'material-design icon-ic_settings_24px' },
  { to: '/workspace/:namespace/:workspaceName/', component: WorkspaceDetailsLoadable },
  { to: '/ide/:namespace/:workspaceName/', component: IdeIframeLoadable },
];

const LayoutComponent = (props: { history: any }): React.ReactElement => {
  return (<Router history={props.history}>
    <Layout items={items.map(item => ({ to: item.to, label: item.label, ico: item.ico }))}>
      {items.map((item: Item, index: number) => (
        <Route key={`app_route_${index + 1}`} path={item.to} exact component={item.component} />
      ))}
      <Redirect path='*' to='/' />
    </Layout>
  </Router>);
};

LayoutComponent.displayName = 'LayoutComponent';

export default LayoutComponent;
