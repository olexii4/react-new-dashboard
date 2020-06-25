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
import { FormGroup, Tooltip, Switch } from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';

type Props = {
  isTemporary: boolean;
  onChange: (isTemporary: boolean) => void;
};
type State = {
  isTemporary: boolean;
};

export class TemporaryStorageFormGroup extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isTemporary: this.props.isTemporary,
    };
  }

  private handleChange(isTemporary: boolean): void {
    this.setState({ isTemporary });
    this.props.onChange(isTemporary);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.isTemporary !== this.props.isTemporary) {
      this.setState({
        isTemporary: this.props.isTemporary,
      });
    }
  }

  public render(): React.ReactNode {
    const isTemporary = this.state.isTemporary;
    const tooltipContent = <div>Temporary storage allows for faster I/O but may have limited storage and is not persistent.</div>;

    return (
      <FormGroup
        label="Temporary Storage"
        labelIcon={
          <Tooltip
            isContentLeftAligned
            content={tooltipContent}
          >
            <QuestionCircleIcon />
          </Tooltip>
        }
        fieldId="temporary-storage"
      >
        <Switch
          id="temporary-storage"
          aria-label="Temporary storage is ON"
          isChecked={isTemporary}
          onChange={_isTemporary => this.handleChange(_isTemporary)}
        />
      </FormGroup>
    );
  }

}

