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

import { Alert, AlertActionCloseButton, AlertGroup, AlertVariant, Spinner, spinnerSize } from '@patternfly/react-core';
import { ConnectedRouter } from 'connected-react-router';
import { NavbarAlerts } from './services/alerts/navbarAlerts';
import { AlertItem } from './services/helpers/types';
import { Redirect, Switch } from 'react-router';
import { container } from './inversify.config';
import React, { Suspense } from 'react';
import { History } from 'history';
import Layout from './Layout';
import Routes from './Routes';

import './app.styl';

export const fallback = (
  <div style={{ height: '100%', textAlign: 'center', opacity: '0.5' }}>
    <Spinner size={spinnerSize.xl} style={{ top: 'calc(50% - 18px)' }} />
  </div>
);

type Props = {
  history: History
};

type State = {
  alerts: AlertItem[];
};

class AppComponent extends React.PureComponent<Props, State> {
  public static displayName = 'AppComponent';

  private readonly navbarAlerts: NavbarAlerts;
  private readonly showAlertHandler: (alerts: AlertItem[]) => void;

  constructor(props: Props) {
    super(props);

    this.state = {
      alerts: [],
    };
    this.navbarAlerts = container.get(NavbarAlerts);
    this.showAlertHandler = (alerts: AlertItem[]) => {
      this.setState({ alerts });
    };
  }

  public componentDidMount(): void {
    this.navbarAlerts.subscribe(this.showAlertHandler);
  }

  public componentWillUnmount(): void {
    this.navbarAlerts.unsubscribe(this.showAlertHandler);
  }

  private getAlert(item: AlertItem): React.ReactElement {
    const { variant, title, key } = item;
    const showAlertTimer = setTimeout(() => {
      this.navbarAlerts.removeAlert(key);
    }, variant === AlertVariant.success ? 2000 : 8000);
    return (
      <Alert variant={variant} title={title} key={key} actionClose={
        <AlertActionCloseButton onClose={() => {
          clearTimeout(showAlertTimer);
          this.navbarAlerts.removeAlert(key);
        }} />
      } />);
  }

  public render(): React.ReactElement {
    const alertGroup = (<AlertGroup isToast>{this.state.alerts.map(alert => this.getAlert(alert))}</AlertGroup>);

    return (
      <ConnectedRouter history={this.props.history}>
        <Layout history={this.props.history}>
          {alertGroup}
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
}

export default AppComponent;
