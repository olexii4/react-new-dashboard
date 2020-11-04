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

import {
  ExclamationCircleIcon,
  InProgressIcon,
  PauseCircleIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons/dist/js/icons';
import React from 'react';
import { WorkspaceStatus } from '../../../services/workspaceStatus';
import { ColorType, StoppedIcon } from '../../WorkspaceStatusLabel';

import styles from './Indicator.module.css';

type Props = {
  status: string;
};

class WorkspaceIndicator extends React.PureComponent<Props> {

  public render(): React.ReactElement {
    const { status } = this.props;

    let color: ColorType;
    switch (status) {
      case WorkspaceStatus[WorkspaceStatus.STOPPED]:
        color = 'grey';
        return (<span className={styles.statusIndicator}><StoppedIcon color={color} /></span>);
      case WorkspaceStatus[WorkspaceStatus.RUNNING]:
        color = 'green';
        return (<span className={styles.statusIndicator}><ResourcesFullIcon color={color} /></span>);
      case WorkspaceStatus[WorkspaceStatus.ERROR]:
        color = 'red';
        return (<span className={styles.statusIndicator}><ExclamationCircleIcon color={color} /></span>);
      case WorkspaceStatus[WorkspaceStatus.PAUSED]:
        color = 'orange';
        return (<span className={styles.statusIndicator}><PauseCircleIcon color={color} /></span>);
      default:
        color = '#0e6fe0';
        return (
          <span className={styles.statusIndicator}>
            <InProgressIcon className={styles.rotate} color={color} />
          </span>
        );
    }
  }
}

export default WorkspaceIndicator;
