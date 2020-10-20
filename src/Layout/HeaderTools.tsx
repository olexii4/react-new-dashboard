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
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from '@patternfly/react-core';

import { ThemeVariant } from './themeVariant';

type Props = {
  userEmail: string;
  userName: string;
  logout: () => void;
  changeTheme: (theme: ThemeVariant) => void;
};
type State = {
  isOpen: boolean;
}

export class HeaderTools extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
    };
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

  private buildDropdownItems(): Array<React.ReactElement> {
    return [
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
    return (
      <DropdownToggle onToggle={isOpen => this.onToggle(isOpen)}>
        {this.props.userName}
      </DropdownToggle>
    );
  }

  public render(): React.ReactElement {
    const { isOpen } = this.state;

    const imageUrl = gravatarUrl(this.props.userEmail, { default: 'retro' });
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
