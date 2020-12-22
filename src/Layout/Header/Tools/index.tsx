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
import gravatarUrl from 'gravatar-url';
import {
  AlertVariant,
  Avatar,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from '@patternfly/react-core';
import { connect, ConnectedProps } from 'react-redux';
import { container } from '../../../inversify.config';
import { AppAlerts } from '../../../services/alerts/appAlerts';
import { CheCliTool } from '../../../services/bootstrap/branding.constant';
import { AlertItem } from '../../../services/helpers/types';
import { KeycloakAuthService } from '../../../services/keycloak/auth';
import { AppState } from '../../../store';
import * as InfrastructureNamespaceStore from '../../../store/InfrastructureNamespace';
import { ThemeVariant } from '../../themeVariant';

import './HeaderTools.styl';

type Props =
  MappedProps
  & {
    onCopyLoginCommand?: () => void;
    user: che.User | undefined;
    logout: () => void;
    changeTheme: (theme: ThemeVariant) => void;
  };
type State = {
  isOpen: boolean;
}

class HeaderTools extends React.PureComponent<Props, State> {
  private readonly appAlerts: AppAlerts;

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this.appAlerts = container.get(AppAlerts);
  }

  private onSelect(): void {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  private onToggle(isOpen: boolean): void {
    this.setState({ isOpen });
  }

  private setTheme(theme: ThemeVariant): void {
    this.props.changeTheme(theme);
  }

  private showAlert(alert: AlertItem): void {
    this.appAlerts.showAlert(alert);
  }

  private getHost(): string {
    const { user } = this.props;
    if (user && user.links) {
      const targetLink = user.links.find(link => link.rel === 'current_user');
      if (targetLink) {
        return new URL(targetLink.href).origin;
      }
    }
    return window.location.host;
  }

  private getCliTool(): CheCliTool {
    return this.props.branding.data.configuration.cheCliTool || 'chectl';
  }

  private getLoginCommand(): string {
    const { keycloak, sso } = KeycloakAuthService;
    let loginCommand = `chectl auth:login ${this.getHost()}`;
    if (!sso) {
      return loginCommand;
    }
    if (!keycloak) {
      throw new Error('Keycloak instance is undefined.');
    }
    if (!keycloak.refreshToken) {
      throw new Error('Refresh token is empty.');
    }
    loginCommand += ` -t ${keycloak.refreshToken}`;
    return loginCommand;
  }

  /**
   * Copies login command in clipboard.
   */
  private copyLoginCommand(): void {
    let loginCommand = '';
    try {
      loginCommand = this.getLoginCommand();
      const copyToClipboardEl = document.createElement('span');
      copyToClipboardEl.appendChild(document.createTextNode(loginCommand));
      const style = copyToClipboardEl.style;
      style.setProperty('position', 'absolute');
      style.setProperty('width', '1px');
      style.setProperty('height', '1px');
      style.setProperty('opacity', '0');
      const bodyEl = document.getElementsByTagName('body')[0];
      bodyEl.append(copyToClipboardEl);
      const range = document.createRange();
      range.selectNode(copyToClipboardEl);
      const selection = document.getSelection();
      if (!selection) {
        throw new Error('Document selection is empty.');
      }
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      copyToClipboardEl.remove();
      this.showAlert({
        key: 'login-command-copied-to-clipboard',
        variant: AlertVariant.success,
        title: 'The login command copied to clipboard.',
      });
    } catch (e) {
      this.showAlert({
        key: 'login-command-copied-to-clipboard-failed',
        variant: AlertVariant.warning,
        title: `Failed to put login to clipboard. ${e}`,
      });
      if (loginCommand) {
        this.showAlert({
          key: 'login-command-info',
          variant: AlertVariant.info,
          title: 'Login command',
          children: (
            <React.Fragment>
              <Button variant={ButtonVariant.link} isInline={true}
                onClick={e => {
                  const target = e.target as Element;
                  target.classList.add('refresh-token-button-hidden');
                }}>
                Click here
              </Button>
              <span> to see the login command and copy it manually.</span>
              <pre className="refresh-token-area">{loginCommand}</pre>
            </React.Fragment>
          ),
        });
      }
    }
  }

  private async onCopyLoginCommand(): Promise<void> {
    const { onCopyLoginCommand } = this.props;
    if (onCopyLoginCommand) {
      onCopyLoginCommand();
    }
    // we need this request because of the token update as a side effect
    await this.props.requestNamespaces();
    this.copyLoginCommand();
  }

  private buildDropdownItems(): Array<React.ReactElement> {
    return [
      (
        <DropdownItem
          key='copy-login-command'
          component='button'
          onClick={async () => await this.onCopyLoginCommand()}
        >
          {`Copy ${this.getCliTool()} login command`}
        </DropdownItem>
      ),
      (
        <DropdownItem
          key='light'
          component='button'
          onClick={(): void => this.setTheme(ThemeVariant.LIGHT)}
        >
          Light Theme
        </DropdownItem>
      ),
      (
        <DropdownItem
          key='dark'
          component='button'
          onClick={(): void => this.setTheme(ThemeVariant.DARK)}
        >
          Dark Theme
        </DropdownItem>
      ),
      (
        <DropdownItem
          key='account_logout'
          component='button'
          onClick={() => this.props.logout()}
        >
          Logout
        </DropdownItem>
      )
    ];
  }

  private buildToggleButton(): React.ReactElement {
    const userName = this.props.user?.name || '';

    return (
      <DropdownToggle onToggle={isOpen => this.onToggle(isOpen)}>
        {userName}
      </DropdownToggle>
    );
  }

  public render(): React.ReactElement {
    const { isOpen } = this.state;

    const userEmail = this.props.user?.email || '';
    const imageUrl = gravatarUrl(userEmail, { default: 'retro' });
    const avatar = <Avatar src={imageUrl} alt='Avatar image' />;

    const toggleButton = this.buildToggleButton();
    const dropdownItems = this.buildDropdownItems();

    return (
      <PageHeaderTools>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem>
            <Dropdown
              isPlain
              position="right"
              onSelect={() => this.onSelect()}
              isOpen={isOpen}
              toggle={toggleButton}
              dropdownItems={dropdownItems}
            />
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        {avatar}
      </PageHeaderTools>
    );
  }

}

const mapStateToProps = (state: AppState) => ({
  branding: state.branding,
});

const connector = connect(
  mapStateToProps,
  InfrastructureNamespaceStore.actionCreators,
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(HeaderTools);
