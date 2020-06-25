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
import { connect } from 'react-redux';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Flex,
  FlexItem,
  FormGroup,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { AppState } from '../../../../store';
import * as DevfileRegistriesStore from '../../../../store/DevfileRegistries';
import { DevfileSelect } from './DevfileSelect';
import { DevfileLocationInput } from './DevfileLocationInput';
import { AlertItem } from '../../../app-common/types';

type Props = {
  devfileRegistries: DevfileRegistriesStore.State;
  onDevfile: (devfile: string) => void;
}
  & DevfileRegistriesStore.ActionCreators;
type State = {
  alerts: AlertItem[];
  metadata: che.DevfileMetaData[];
};

export class DevfileSelectorFormGroup extends React.PureComponent<Props, State> {

  private devfileSelectRef: React.RefObject<DevfileSelect>;
  private devfileLocationRef: React.RefObject<DevfileLocationInput>;

  constructor(props: Props) {
    super(props);

    this.state = {
      alerts: [],
      metadata: this.props.devfileRegistries.metadata,
    };

    this.devfileSelectRef = React.createRef();
    this.devfileLocationRef = React.createRef();
  }

  private onDevfileSelected(meta: che.DevfileMetaData): void {
    // clear location input
    this.devfileLocationRef.current?.clearInput();

    try {
      this.loadDevfile(meta.links.self);
    } catch {
      // noop
    }
  }

  private async onLocationChanged(location: string): Promise<void> {
    // clear devfile select
    this.devfileSelectRef.current?.clearSelect();

    try {
      await this.loadDevfile(location);
    } catch {
      this.devfileLocationRef.current?.invalidateInput();
    }
  }

  private async loadDevfile(location: string): Promise<void> {
    try {
      const devfileContent = await this.props.requestDevfile(location);
      this.props.onDevfile(devfileContent);
    } catch (e) {
      console.warn('Failed to load devfile.', e);

      this.showAlert({
        key: 'load-devfile-failed',
        title: 'Failed to load devfile.',
        variant: AlertVariant.warning,
      });

      throw new Error(e);
    }
  }

  private showAlert(alert: AlertItem): void {
    const alerts = [...this.state.alerts, alert];
    this.setState({ alerts });
  }

  private removeAlert(key: string): void {
    this.setState({ alerts: [...this.state.alerts.filter(al => al.key !== key)] });
  }

  public render(): React.ReactNode {
    const { alerts, metadata } = this.state;

    return (
      <React.Fragment>
        <AlertGroup isToast>
          {alerts.map(({ title, variant, key }) => (
            <Alert
              variant={variant}
              title={title}
              key={key}
              actionClose={<AlertActionCloseButton onClose={() => this.removeAlert(key)} />}
            />
          ))}
        </AlertGroup>
        <FormGroup
          label='Devfile'
          isRequired
          fieldId='devfile-selector'
        >
          <TextContent>
            <Text component={TextVariants.small}>
              Select a devfile from a templates or enter devfile URL
            </Text>
          </TextContent>
          <Flex direction={{ default: 'column', lg: 'row' }} >
            <Flex
              direction={{ default: 'row' }}
              grow={{ default: 'grow' }}
            >
              <FlexItem grow={{ default: 'grow' }}>
                <DevfileSelect
                  ref={this.devfileSelectRef}
                  metadata={metadata}
                  onSelect={meta => this.onDevfileSelected(meta)}
                />
              </FlexItem>
              <span>or</span>
            </Flex>
            <FlexItem grow={{ default: 'grow' }}>
              <DevfileLocationInput
                ref={this.devfileLocationRef}
                onChange={location => this.onLocationChanged(location)}
              />
            </FlexItem>
          </Flex>
        </FormGroup>
      </React.Fragment>
    );
  }

}

export default connect(
  (state: AppState) => ({
    devfileRegistries: state.devfileRegistries,
  }),
  DevfileRegistriesStore.actionCreators,
)(DevfileSelectorFormGroup);
