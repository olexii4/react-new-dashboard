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
import {
  Brand,
  PageHeader,
} from '@patternfly/react-core';
import { User } from 'che';

import { HeaderTools } from './HeaderTools';
import { ThemeVariant } from './themeVariant';

import * as styles from './Header.module.css';

type Props = {
  isVisible: boolean;
  logoUrl: string;
  user: User | undefined;
  logout: () => void;
  toggleNav: () => void;
  changeTheme: (theme: ThemeVariant) => void;
};
type State = {
  isVisible: boolean;
};

export default class Header extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isVisible: this.props.isVisible,
    };
  }

  private toggleNav(): void {
    this.props.toggleNav();
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.isVisible !== this.props.isVisible) {
      this.setState({
        isVisible: this.props.isVisible,
      });
    }
  }

  public render(): React.ReactElement {
    const logo = <Brand src={`${this.props.logoUrl}`} alt='Logo' />;

    const userEmail = this.props.user?.email || '';
    const userName = this.props.user?.name || '';

    const className = this.state.isVisible ? styles.headerShow : styles.headerHide;

    return (
      <PageHeader
        className={className}
        logo={logo}
        logoProps={{ href: 'https://www.eclipse.org/che/', target: '_blank' }}
        showNavToggle={true}
        onNavToggle={() => this.toggleNav()}
        headerTools={
          <HeaderTools
            userEmail={userEmail}
            userName={userName}
            logout={() => this.props.logout()}
            changeTheme={theme => this.props.changeTheme(theme)}
          />
        }
      />
    );
  }

}
