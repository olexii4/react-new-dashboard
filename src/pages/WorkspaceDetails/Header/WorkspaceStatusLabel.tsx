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
  BanIcon,
  ErrorCircleOIcon,
  InProgressIcon,
  PauseCircleIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons/dist/js/icons';
import React from 'react';
import { Label } from '@patternfly/react-core';
import { WorkspaceStatus } from '../../../services/api/workspaceStatus';

import styles from './WorkspaceStatusLabel.module.css';

type Props = {
  status: string | undefined;
}

class WorkspaceStatusLabel extends React.PureComponent<Props> {

  render(): React.ReactElement {
    const { status } = this.props;

    let color: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey';

    switch (status) {
      case WorkspaceStatus[WorkspaceStatus.STOPPED]:
        color = 'grey';
        return (
          <Label
            className={styles.label}
            color={color}
            icon={<BanIcon color={color} />}
          >
            {status}
          </Label>
        );
      case WorkspaceStatus[WorkspaceStatus.RUNNING]:
        color = 'green';
        return (
          <Label
            className={styles.label}
            color={color}
            icon={<ResourcesFullIcon color={color} />}
          >
            {status}
          </Label>
        );
      case WorkspaceStatus[WorkspaceStatus.ERROR]:
        color = 'red';
        return (
          <Label
            className={styles.label}
            color={color}
            icon={<ErrorCircleOIcon color={color} />}
          >
            {status}
          </Label>
        );
      case WorkspaceStatus[WorkspaceStatus.PAUSED]:
        color = 'orange';
        return (
          <Label
            className={styles.label}
            color={color}
            icon={<PauseCircleIcon color={color} />}
          >
            {status}
          </Label>
        );
      default:
        color = 'blue';
        return (
          <Label
            className={styles.label}
            color={color}
            icon={<InProgressIcon className={styles.rotate} color={color} />}
          >
            {status}
          </Label>
        );
    }
  }

}

export default WorkspaceStatusLabel;
