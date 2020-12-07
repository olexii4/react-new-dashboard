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

import { Alert, AlertActionCloseButton, AlertGroup, AlertVariant } from '@patternfly/react-core';
import React from 'react';
import { container } from '../../inversify.config';
import { AppAlerts } from '../../services/alerts/appAlerts';
import { AlertItem } from '../../services/helpers/types';

type Props = {};

type State = {
  alerts: AlertItem[];
};

class AppAlertGroup extends React.PureComponent<Props, State> {
  private readonly appAlerts: AppAlerts;
  private readonly showAlertHandler: (alerts: AlertItem[]) => void;

  constructor(props: Props) {
    super(props);

    this.state = {
      alerts: [],
    };
    this.appAlerts = container.get(AppAlerts);
    this.showAlertHandler = (alerts: AlertItem[]) => {
      this.setState({ alerts });
    };
  }

  public componentDidMount(): void {
    this.appAlerts.subscribe(this.showAlertHandler);
  }

  public componentWillUnmount(): void {
    this.appAlerts.unsubscribe(this.showAlertHandler);
  }

  private getAlert(item: AlertItem): React.ReactElement {
    const { variant, title, key } = item;
    const showAlertTimer = setTimeout(() => {
      this.appAlerts.removeAlert(key);
    }, variant === AlertVariant.success ? 2000 : 8000);
    return (
      <Alert variant={variant} title={title} key={key} actionClose={
        <AlertActionCloseButton onClose={() => {
          clearTimeout(showAlertTimer);
          this.appAlerts.removeAlert(key);
        }} />
      } />);
  }

  public render(): React.ReactElement {
    return (
      <AlertGroup isToast>{this.state.alerts.map(alert => this.getAlert(alert))}</AlertGroup>
    );
  }
}

export default AppAlertGroup;
