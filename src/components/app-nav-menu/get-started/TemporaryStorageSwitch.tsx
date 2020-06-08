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

import React, { FormEvent } from 'react';
import {
  Switch,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';


type TemporaryStorageSwitchProps = {
  persistVolumesDefault: string;
  onChange: (temporary: boolean) => void;
};

type TemporaryStorageSwitchState = {
  isChecked: boolean;
};

export class TemporaryStorageSwitch extends React.PureComponent<TemporaryStorageSwitchProps, TemporaryStorageSwitchState> {

  private handleChange: (checked: boolean, event: FormEvent<HTMLInputElement>) => void;

  constructor(props) {
    super(props);

    this.state = {
      isChecked: this.props.persistVolumesDefault === 'false',
    };

    this.handleChange = (isChecked: boolean): void => {
      this.setState({ isChecked });
      this.props.onChange(isChecked);
    };
  }

  render(): React.ReactElement {
    const isChecked = this.state.isChecked;
    return (
      <React.Fragment>
        <Switch
          id="simple-switch"
          label="Temporary Storage On"
          labelOff="Temporary Storage Off"
          isChecked={isChecked}
          onChange={this.handleChange}
          aria-describedby="temporary-storage-tooltip"
        />
        <span style={{ marginLeft: '10px' }}>
          <Tooltip
            id="temporary-storage-tooltip"
            isContentLeftAligned={true}
            position={TooltipPosition.top}
            content={
              <div>Temporary Storage allows for faster I/O but may have limited storage and is not persistent.</div>
            }
          >
            <OutlinedQuestionCircleIcon />
          </Tooltip>
        </span>
      </React.Fragment>
    );
  }

}
