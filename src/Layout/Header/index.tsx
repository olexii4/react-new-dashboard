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

import HeaderTools from './Tools';
import { ThemeVariant } from '../themeVariant';

import * as styles from './index.module.css';

type Props = {
  isVisible: boolean;
  helpPath: string;
  logoUrl: string;
  user: User | undefined;
  logout: () => void;
  toggleNav: () => void;
  changeTheme: (theme: ThemeVariant) => void;
  onCopyLoginCommand: () => Promise<void>;
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

  private get host(): string {
    const { user } = this.props;
    if (user && user.links) {
      const targetLink = user.links.find(link => link.rel === 'current_user');
      if (targetLink) {
        return new URL(targetLink.href).origin;
      }
    }
    return '';
  }

  public render(): React.ReactElement {
    const logo = <Brand src={this.props.logoUrl} alt='Logo' />;

    const userEmail = this.props.user?.email || '';
    const userName = this.props.user?.name || '';

    const className = this.state.isVisible ? styles.headerShow : styles.headerHide;

    return (
      <PageHeader
        className={className}
        logo={logo}
        logoProps={{ href: this.props.helpPath, target: '_blank' }}
        showNavToggle={true}
        onNavToggle={() => this.toggleNav()}
        headerTools={
          <HeaderTools
            userEmail={userEmail}
            userName={userName}
            host={this.host}
            logout={() => this.props.logout()}
            changeTheme={theme => this.props.changeTheme(theme)}
            onCopyLoginCommand={async () => this.props.onCopyLoginCommand()}
          />
        }
      />
    );
  }

}
