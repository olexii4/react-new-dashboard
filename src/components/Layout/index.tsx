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
import { connect } from 'react-redux';
import { Page } from '@patternfly/react-core';

import Header from './Header';
import Sidebar from './Sidebar';
import { ThemeVariant } from './themeVariant';
import { AppState } from '../../store';
import { container } from '../../inversify.config';
import { Keycloak } from '../../services/keycloak/Keycloak';
import * as BrandingStore from '../../store/Branding';
import * as UserStore from '../../store/User';

const THEME_KEY = 'theme';
const IS_MANAGED_SIDEBAR = false;

type Props = {
  children: React.ReactNode;
} & {
  brandingStore: BrandingStore.State;
  userStore: UserStore.UserState;
};
type State = {
  isSidebarVisible: boolean;
  isHeaderVisible: boolean;
  theme: ThemeVariant;
};

export class Layout extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    const theme: ThemeVariant = window.sessionStorage.getItem(THEME_KEY) as ThemeVariant || ThemeVariant.DARK;

    this.state = {
      isHeaderVisible: true,
      isSidebarVisible: true,
      theme,
    };
  }

  private logout(): void {
    const keycloak = container.get(Keycloak);
    keycloak.logout();
  }

  private toggleNav(): void {
    this.setState({
      isSidebarVisible: !this.state.isSidebarVisible,
    });
  }

  private changeTheme(theme: ThemeVariant): void {
    this.setState({ theme });
    window.sessionStorage.setItem(THEME_KEY, theme);
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data === 'show-navbar') {
      this.setState({
        isSidebarVisible: true,
        isHeaderVisible: true,
      });
    } else if (event.data === 'hide-navbar') {
      this.setState({
        isSidebarVisible: false,
        isHeaderVisible: false,
      });
    }
  }

  componentDidMount(): void {
    window.addEventListener(
      'message',
      event => this.handleMessage(event),
      false
    );
  }

  componentWillUnmount(): void {
    window.removeEventListener(
      'message',
      event => this.handleMessage(event)
    );
  }

  public render(): React.ReactElement {
    const { isHeaderVisible, isSidebarVisible, theme } = this.state;

    const user = this.props.userStore.user;
    const logoUrl = this.props.brandingStore.data.logoFile;
    const helpPath = this.props.brandingStore.data.helpPath;

    return (
      <Page
        header={
          <Header
            isVisible={isHeaderVisible}
            helpPath={helpPath}
            logoUrl={logoUrl}
            user={user}
            logout={() => this.logout()}
            toggleNav={() => this.toggleNav()}
            changeTheme={theme => this.changeTheme(theme)}
          />
        }
        sidebar={
          <Sidebar
            isManaged={IS_MANAGED_SIDEBAR}
            isNavOpen={isSidebarVisible}
            theme={theme}
          />
        }
        isManagedSidebar={IS_MANAGED_SIDEBAR}
      >
        {this.props.children}
      </Page>
    );
  }

}

export default connect(
  (state: AppState) => {
    return {
      brandingStore: state.branding,
      userStore: state.user,
    };
  }
)(Layout);
