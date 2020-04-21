import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { ConnectedRouter as Router } from 'connected-react-router';
import Layout from './app-nav-menu//Layout';
import Dashboard from './app-nav-menu/dashboard/Dashboard';
import SamplesList from './app-nav-menu/get-started/SamplesList';
import WorkspacesList from './app-nav-menu/workspaces/WorkspacesList';
import Administration from './app-nav-menu/administration/Administration';
import WorkspaceDetails from './workspace-details/WorkspaceDetails';
import IdeIframe from './ide-iframe/IdeIframe';

import './app.styl';

type Item = {
  to: string;
  component: React.FunctionComponent<any>;
  label?: string;
  ico?: string;
};

const items: Item[] = [
  { to: '/', component: Dashboard, label: 'Dashboard', ico: 'chefont cheico-dashboard' },
  { to: '/getstarted', component: SamplesList, label: 'Get Started', ico: 'fa fa-plus' },
  { to: '/workspaces', component: WorkspacesList, label: 'Workspaces', ico: 'chefont cheico-workspace' },
  { to: '/administration', component: Administration, label: 'Administration', ico: 'material-design icon-ic_settings_24px' },
  { to: '/workspace/:namespace/:workspaceName/', component: WorkspaceDetails },
  { to: '/ide/:namespace/:workspaceName/', component: IdeIframe },
];

const LayoutComponent = (props: { history: any }): React.ReactElement => {
  return (<Router history={props.history}>
    <Layout items={items.map(item => ({ to: item.to, label: item.label, ico: item.ico }))}>
      {items.map((item: Item, index: number) => (
        <Route key={`app_route_${index + 1}`} path={item.to} exact component={item.component} />
      ))}
      <Redirect path='*' to='/getstarted' />
    </Layout>
  </Router>);
};

LayoutComponent.displayName = 'LayoutComponent';

export default LayoutComponent;
