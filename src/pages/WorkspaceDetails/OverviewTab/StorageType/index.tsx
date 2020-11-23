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
  TextVariants,
  TextContent,
  Text,
  Radio,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';
import { StorageType } from '../../../../services/helpers/types';
import { AppState } from '../../../../store';
import { connect, ConnectedProps } from 'react-redux';
import { OutlinedQuestionCircleIcon, PencilAltIcon } from '@patternfly/react-icons';
import { selectSettings } from '../../../../store/Workspaces/selectors';

import styles from './index.module.css';

type Props =
  MappedProps
  & {
    storageType?: StorageType;
    onSave?: (storageType: StorageType) => void;
  };
type State = {
  isSelectorOpen?: boolean;
  selected?: string;
  isInfoOpen?: boolean;
};

export class StorageTypeFormGroup extends React.PureComponent<Props, State> {
  storageTypes: StorageType[] = [];
  options: string[] = [];
  preferredType: string;

  constructor(props: Props) {
    super(props);

    this.state = {
      isSelectorOpen: false,
      isInfoOpen: false,
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

  private handleEditToggle(isSelectorOpen: boolean): void {
    this.setState({ isSelectorOpen });
  }

  private handleInfoToggle(): void {
    this.setState(({ isInfoOpen }) => ({
      isInfoOpen: !isInfoOpen,
    }));
  }

  private getExistingTypes(): { hasAsync: boolean, hasPersistent: boolean, hasEphemeral: boolean } {
    const hasAsync = this.storageTypes.some(type => StorageType[type] === StorageType.async);
    const hasPersistent = this.storageTypes.some(type => StorageType[type] === StorageType.persistent);
    const hasEphemeral = this.storageTypes.some(type => StorageType[type] === StorageType.ephemeral);

    return { hasAsync, hasPersistent, hasEphemeral };
  }

  private getInfoModalContent(): React.ReactNode {
    const { hasAsync, hasPersistent, hasEphemeral } = this.getExistingTypes();

    const asyncTypeDescr = hasAsync ?
      (<Text><span className={styles.experimentalStorageType}> Experimental feature </span><br />
        <b>Asynchronous Storage </b>
        is combination of Ephemeral and Persistent storages. It allows for faster I / O and keeps your changes,
        it does backup the workspace on stop and restores it on start.</Text>) : '';
    const persistentTypeDescr = hasPersistent ?
      (<Text><b>Persistent Storage</b> is slow I/O but persistent.</Text>) : '';
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

  private getSelectorModal(): React.ReactNode {
    const { hasAsync, hasPersistent, hasEphemeral } = this.getExistingTypes();
    const { isSelectorOpen, selected } = this.state;
    const originSelection = this.props.storageType ? this.props.storageType : this.preferredType;

    const asyncTypeDescr = hasAsync ?
      (<Text component={TextVariants.h6}><Radio
        label="Asynchronous" name="asynchronous" id="async-type-radio"
        description={`Asynchronous this is combination of Ephemeral and Persistent storage. Allows for faster I/O
         and keeps your changes, will backup on stop and restores on start.`}
        isChecked={selected === StorageType.async}
        onChange={() => this.setState({ selected: StorageType.async })}
      /></Text>) : '';
    const persistentTypeDescr = hasPersistent ?
      (<Text component={TextVariants.h6}><Radio
        label="Persistent" name="persistent" id="persistent-type-radio"
        description="Persistent Storage slow I/O but persistent."
        isChecked={selected === StorageType.persistent}
        onChange={() => this.setState({ selected: StorageType.persistent })}
      /></Text>) : '';
    const ephemeralTypeDescr = hasEphemeral ?
      (<Text component={TextVariants.h6}><Radio
        label="Ephemeral" name="ephemeral" id="ephemeral-type-radio"
        description="Ephemeral Storage allows for faster I/O but may have limited storage and is not persistent."
        isChecked={selected === StorageType.ephemeral}
        onChange={() => this.setState({ selected: StorageType.ephemeral })}
      /></Text>) : '';

    return (
      <Modal variant={ModalVariant.small} isOpen={isSelectorOpen} className={styles.modalEditStorageType}
        title="Edit Storage Type"
        onClose={() => this.handleCancelChanges()}
        actions={[
          <Button key="confirm" variant="primary" isDisabled={originSelection === selected}
            onClick={() => this.handleConfirmChanges()}>Save</Button>,
          <Button key="cancel" variant="secondary" onClick={() => this.handleCancelChanges()}>Cancel</Button>,
        ]}
      >
        <TextContent>
          <Alert variant={AlertVariant.warning} className={styles.warningAlert}
            title="Note that after changing the storage type you may lose workspace data." isInline />
          <Text component={TextVariants.h6}>Select the storage type</Text>
          {persistentTypeDescr}
          {ephemeralTypeDescr}
          {asyncTypeDescr}
        </TextContent>
      </Modal>);
  }

  private handleConfirmChanges(): void {
    const selection = this.state.selected as StorageType;
    if (this.props.onSave) {
      this.props.onSave(selection);
    }
    this.setState({
      selected: selection,
      isSelectorOpen: false,
    });
  }

  private handleCancelChanges(): void {
    const originSelection = this.props.storageType ? this.props.storageType : this.preferredType;
    this.setState({ selected: originSelection });
    this.handleEditToggle(false);
  }

  public render(): React.ReactNode {
    const { selected, isInfoOpen } = this.state;

    return (
      <FormGroup
        label="Storage Type"
        fieldId="storage-type"
        labelIcon={
          <Button variant="plain" onClick={() => this.handleInfoToggle()} className={styles.labelIcon}>
            <OutlinedQuestionCircleIcon />
          </Button>
        }>
        <span className={styles.storageType}>
          {selected}
          <Button variant="plain" onClick={() => this.handleEditToggle(true)}>
            <PencilAltIcon />
          </Button>
        </span>
        {this.getSelectorModal()}
        <Modal title="Storage Type info" variant={ModalVariant.small} isOpen={isInfoOpen} onClose={() => {
          this.handleInfoToggle();
        }}>
          {this.getInfoModalContent()}
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

type MappedProps = ConnectedProps<typeof connector>;
export default connector(StorageTypeFormGroup);
