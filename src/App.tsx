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
import { Redirect, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';

import Routes from './Routes';
import Layout from './Layout';

import './app.styl';

// todo improve fallback
const fallback = <div>loading....</div>;

function AppComponent(props: { history: History }): React.ReactElement {
  return (
    <ConnectedRouter history={props.history}>
      <Layout history={props.history}>
        <Suspense fallback={fallback}>
          <Switch>
            <Routes />
            <Redirect path='*' to='/' />
          </Switch>
        </Suspense>
      </Layout>
    </ConnectedRouter>
  );
}
AppComponent.displayName = 'AppComponent';
export default AppComponent;
