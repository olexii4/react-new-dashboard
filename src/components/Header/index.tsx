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
import { PageSection, Text, TextContent } from '@patternfly/react-core';
import { SECTION_THEME } from '../../pages/loadFactory';
import WorkspaceStatusLabel from '../WorkspaceStatusLabel/WorkspaceStatusLabel';

import styles from './Header.module.css';

type Props = {
  status: string | undefined;
  workspaceName: string;
};

class Header extends React.PureComponent<Props> {

  public render(): React.ReactElement {
    const { workspaceName, status } = this.props;

    return (
      <PageSection variant={SECTION_THEME} className={styles.loadFactoryHeader}>
        <TextContent>
          <Text component='h1'>
            Starting workspace {workspaceName}
            <WorkspaceStatusLabel status={status} />
          </Text>
        </TextContent>
      </PageSection>
    );
  }
}

export default Header;
