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

export enum StorageType {
  'async' = 'Asynchronous',
  'ephemeral' = 'Ephemeral',
  'persistent' = 'Persistent',
}

type Props = {
  storageType: StorageType;
  onChange: (storageType: StorageType) => void;
};
type State = {
  storageType: StorageType;
};

export class StorageTypeFormGroup extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      storageType: this.props.storageType,
    };
  }

  private handleChange(storageType: StorageType): void {
    this.setState({ storageType });
    this.props.onChange(storageType);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.storageType !== this.props.storageType) {
      this.setState({
        storageType: this.props.storageType,
      });
    }
  }

  public render(): React.ReactNode {
    const isTemporary = this.state.storageType;

    const fieldId = 'storage-type';
    return (
      <FormGroup
        label="Storage Type"
        fieldId={fieldId}
      >

      </FormGroup>
    );
  }

}

