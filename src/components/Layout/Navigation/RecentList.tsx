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
  NavGroup,
  NavList,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';

import NavigationRecentItem from './RecentItem';
import { NavigationItemObject, NavigationRecentItemObject } from '.';
import NavigationMainItem from './MainItem';

import styles from './index.module.css';

function buildCreateWorkspaceItem(): React.ReactElement {
  const item: NavigationItemObject = {
    to: '/get-started#custom-workspace',
    label: 'Create Workspace',
    icon: <PlusIcon className={styles.mainItemIcon} />,
  };
  return (
    <NavigationMainItem item={item}>
      {item.icon}
    </NavigationMainItem>
  );
}

function buildRecentWorkspacesItems(workspaces: Array<che.Workspace>, activeItem: string): Array<React.ReactElement> {
  return workspaces.map(workspace => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const name = workspace.devfile.metadata.name!;
    const namespace = workspace.namespace;
    const item: NavigationRecentItemObject = {
      to: `/ide/${namespace}/${name}`,
      label: name,
      status: workspace.status,
    };
    return <NavigationRecentItem key={item.to} item={item} activeItem={activeItem} />;
  });
}

function NavigationRecentList(props: { workspaces: Array<che.Workspace>, activeItem: string }): React.ReactElement {
  const createWorkspaceItem = buildCreateWorkspaceItem();
  const recentWorkspaceItems = buildRecentWorkspacesItems(props.workspaces, props.activeItem);
  return (
    <NavList>
      <NavGroup title="RECENT WORKSPACES">
        {createWorkspaceItem}
        {recentWorkspaceItems}
      </NavGroup>
    </NavList>
  );
}
NavigationRecentList.displayName = 'NavigationRecentListComponent';
export default NavigationRecentList;