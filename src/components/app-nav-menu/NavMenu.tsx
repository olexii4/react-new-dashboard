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
import { Link } from 'react-router-dom';
import gravatarUrl from 'gravatar-url';
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import { css } from '@patternfly/react-styles';
import {
  Avatar,
  Brand,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSidebar,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';

import { container } from '../../inversify.config';
import { Keycloak } from '../../services/keycloak/Keycloak';
import WorkspaceIndicator from './workspaces/workspace-indicator/WorkspaceIndicator';
import './nav-menu.styl';

const DARK = 'dark';
const LIGHT = 'light';

type INavItem = { to: string; label?: string; ico?: string };

/**
 * This class prepares the main dashboard page with nav menu.
 * @author Oleksii Orel
 */
// TODO specify the types correctly(remove <any, any>).
export class NavMenu extends React.PureComponent<any, any> {
  private readonly onDropdownToggle: (isOpen: boolean) => void;
  private readonly onDropdownSelect: (event: any) => void;
  private readonly onNavSelect: (item: any) => void;
  private readonly onNavToggle: () => void;
  private readonly onTheme: (item: string) => void;
  private readonly onLogout: () => void;
  private readonly handleMessage: (event: any) => void;

  constructor(props: any) {
    super(props);

    const currentTheme = window.sessionStorage.getItem('theme');
    const theme = currentTheme ? currentTheme : DARK;
    this.state = { isDropdownOpen: false, activeItem: '/', isNavOpen: true, theme };

    const keycloak = container.get(Keycloak);

    this.onTheme = (theme: string): void => {
      this.setState({ theme });
      window.sessionStorage.setItem('theme', theme);
    };
    this.onLogout = (): void => {
      keycloak.logout();
    };
    this.onDropdownToggle = (isDropdownOpen: any): void => {
      this.setState({ isDropdownOpen });
    };
    this.onDropdownSelect = (): void => {
      this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
    };
    this.onNavSelect = (result: any): void => {
      this.setState({ activeItem: result.itemId });
    };
    this.onNavToggle = (): void => {
      this.setState({ isNavOpen: !this.state.isNavOpen });
    };

    this.handleMessage = (event): void => {
      if (event.data === 'show-navbar') {
        this.setState({ isNavOpen: true });
      } else if (event.data === 'hide-navbar') {
        this.setState({ isNavOpen: false });
      }
    };
  }

  componentDidMount(): void {
    window.addEventListener('message', this.handleMessage, false);
  }

  componentWillUnmount(): void {
    window.removeEventListener('message', this.handleMessage);
  }

  render(): React.ReactElement {
    const { isDropdownOpen, activeItem, isNavOpen, theme } = this.state;
    // create a Sidebar
    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label='Nav' theme={theme}>
        <NavList>
          {this.props.items.filter((item: INavItem) => !!item.label).map((item: INavItem, index: number) => (
            <NavItem key={`nav_bar_item_${index + 1}`} itemId={item.to} isActive={activeItem === item.to}>
              <Link to={item.to}><i className={item.ico}>&nbsp;&nbsp;</i>{item.label}</Link>
            </NavItem>
          ))}
          <NavGroup title='RECENT WORKSPACES'>
            <NavItem><Link to={this.props.creationLink}><i className='fa fa-plus'>&nbsp;&nbsp;</i>
                            Create Workspace
                        </Link></NavItem>
            {this.props.workspaces.map((workspace: any, index: number) =>
              <NavItem key={`nav_bar_sub_item_${index + 1}`} itemId={`wrksp_${index + 1}`}
                isActive={activeItem === `wrksp_${index + 1}`}>
                <Link to={`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`}>
                  <span className="workspace-name">
                    <WorkspaceIndicator status={workspace.status} />
                    {`${workspace.namespace}/${workspace.devfile.metadata.name}`}
                  </span>
                </Link>
              </NavItem>
            )}
          </NavGroup>
        </NavList>
      </Nav>
    );

    const getUserName = (): string => {
      const user = this.props.user;
      if (user.given_name && user.family_name) {
        return `${user.given_name} ${user.family_name}`;
      }
      return user.name;
    };

    const UserDropdownItems = [
      <DropdownItem key='white' onClick={(): void => this.onTheme(LIGHT)} component='button'>Light theme</DropdownItem>,
      <DropdownItem key='dark' onClick={(): void => this.onTheme(DARK)} component='button'>Dark theme</DropdownItem>,
      <DropdownItem key='account_details'>Account details</DropdownItem>,
      <DropdownItem key='account_logout' onClick={this.onLogout} component='button'>Logout</DropdownItem>
    ];

    const UserDropdownToggle = (<DropdownToggle onToggle={this.onDropdownToggle}>{getUserName()}</DropdownToggle>);
    const PageToolbar = (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
            <Dropdown toggle={UserDropdownToggle} isOpen={isDropdownOpen} isPlain position='right'
              dropdownItems={UserDropdownItems} onSelect={this.onDropdownSelect} />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const Avatar = this.buildAvatar();
    const Logo = <Brand src={`${this.props.logoURL}`} alt='' />;
    const Header = (
      <PageHeader
        className={isNavOpen ? 'nav-show' : 'nav-hide'}
        logo={Logo}
        logoProps={{ href: 'https://www.eclipse.org/che/', target: '_blank' }}
        toolbar={PageToolbar}
        avatar={Avatar}
        isNavOpen={isNavOpen}
        onNavToggle={this.onNavToggle}
      />
    );

    const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} theme={theme} />;

    return (<Page header={Header} sidebar={Sidebar}>
      <PageSection variant={PageSectionVariants.default} noPadding={true}>
        {this.props.children}
      </PageSection>
    </Page>);
  }

  buildAvatar(): React.ReactElement {
    const email = this.props.user?.email;
    const imageUrl = gravatarUrl(email, { default: 'retro' });
    return <Avatar src={imageUrl} alt='Avatar image' />;
  }

}
