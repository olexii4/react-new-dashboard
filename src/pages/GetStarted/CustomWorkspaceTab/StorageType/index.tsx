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
  FormGroup,
  Button,
  Modal,
  ModalVariant,
  Select,
  SelectOption,
  SelectVariant,
  SelectDirection,
  TextContent,
  Text
} from '@patternfly/react-core';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../../store';

import styles from './index.module.css';
import { selectSettings } from '../../../../store/Workspaces/selectors';

export enum StorageType {
  async = 'Asynchronous',
  ephemeral = 'Ephemeral',
  persistent = 'Persistent',
}

type Props =
  MergedProps
  & {
    storageType?: StorageType;
    onChange?: (storageType: StorageType) => void;
  };
type State = {
  isOpen?: boolean;
  selected?: string;
  isModalOpen?: boolean;
};

export class StorageTypeFormGroup extends React.PureComponent<Props, State> {
  storageTypes: StorageType[] = [];
  preferredType: string;
  options: string[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
      isModalOpen: false,
    };

    const settings = this.props.settings;
    if (settings) {
      const available_types = settings['che.workspace.storage.available_types'];
      if (available_types) {
        this.storageTypes = available_types.split(',') as StorageType[];
        this.preferredType = settings['che.workspace.storage.preferred_type'];
        this.storageTypes.forEach(type => {
          const value = StorageType[type];
          this.options.push(value);
        });
      }
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.storageType !== this.props.storageType) {
      const selected = this.props.storageType;
      this.setState({ selected });
    }
  }

  public componentDidMount(): void {
    const selected = this.props.storageType ? this.props.storageType : this.preferredType;
    this.setState({ selected });
  }

  private handleToggle(isOpen: boolean): void {
    this.setState({ isOpen });
  }

  private handleSelect(event, selection): void {
    if (this.props.onChange) {
      this.props.onChange(selection);
    }
    this.setState({
      selected: selection,
      isOpen: false
    });
  }

  private handleModalToggle(): void {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen
    }));
  }

  private getModalContent(): React.ReactNode {
    const hasAsync = this.storageTypes.some(type => StorageType[type] === StorageType.async);
    const asyncTypeDescr = hasAsync ?
      (<Text><span className={styles.experimentalStorageType}> Experimental feature </span><br />
        <b>Asynchronous Storage </b>
        is combination of Ephemeral and Persistent storages. It allows for faster I / O and keeps your changes,
        it does backup the workspace on stop and restores it on start.</Text>) : '';
    const hasPersistent = this.storageTypes.some(type => StorageType[type] === StorageType.persistent);
    const persistentTypeDescr = hasPersistent ?
      (<Text><b>Persistent Storage</b> is slow I/O but persistent.</Text>) : '';
    const hasEphemeral = this.storageTypes.some(type => StorageType[type] === StorageType.ephemeral);
    const ephemeralTypeDescr = hasEphemeral ?
      (<Text><b>Ephemeral Storage</b> allows for faster I/O but may have limited
        storage and is not persistent.</Text>) : '';
    const href = this.props.brandingStore.data.docs.storageTypes;

    return (<TextContent>
      {persistentTypeDescr}
      {ephemeralTypeDescr}
      {asyncTypeDescr}
      <Text><a rel="noreferrer" target="_blank" href={href}>Open documentation page</a></Text>
    </TextContent>);
  }

  public render(): React.ReactNode {
    const { isOpen, selected, isModalOpen } = this.state;

    return (
      <FormGroup
        label="Storage Type"
        fieldId="storage-type"
      >
        <Select
          className={styles.storageTypeSelector}
          aria-label="Storage Type Selector"
          aria-labelledby="storage-type-selector-id-1"
          variant={SelectVariant.single}
          direction={SelectDirection.down}
          onToggle={_isOpen => this.handleToggle(_isOpen)}
          onSelect={(event, selection) => this.handleSelect(event, selection)}
          selections={selected}
          isOpen={isOpen}
        >
          {this.options.map((option: string) => (
            <SelectOption
              key={option}
              value={option}
            />
          ))}
        </Select>
        <Button variant="link" onClick={() => this.handleModalToggle()}>
          Learn more about storage types
        </Button>
        <Modal
          variant={ModalVariant.small}
          isOpen={isModalOpen}
          aria-label="Storage types info"
          showClose={true}
          aria-describedby="storage-types-info"
          onClose={() => this.handleModalToggle()}
        >
          {this.getModalContent()}
        </Modal>
      </FormGroup>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  brandingStore: state.branding,
  settings: selectSettings(state),
});

const connector = connect(
  mapStateToProps,
);

type MergedProps = ConnectedProps<typeof connector>;
export default connector(StorageTypeFormGroup);
