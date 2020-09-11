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
import { connect, ConnectedProps } from 'react-redux';
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
import * as FactoryResolverStore from '../../../../store/FactoryResolver';
import { DevfileSelect } from './DevfileSelect';
import { DevfileLocationInput } from './DevfileLocationInput';
import { AlertItem } from '../../../../services/types';
import { safeLoad } from 'js-yaml';

import styles from './index.module.css';

type Props =
  MergedProps
  & {
    devfileRegistries: DevfileRegistriesStore.State;
    onDevfile: (devfile: che.WorkspaceDevfile) => void;
    onClear?: () => void;
  };
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

  private handleDevfileClear(): void {
    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  private async handleDevfileSelect(meta: che.DevfileMetaData): Promise<void> {
    // clear location input
    this.devfileLocationRef.current?.clearInput();
    try {
      const devfileContent = await this.props.requestDevfile(meta.links.self) as string;
      const devfile = safeLoad(devfileContent);
      this.props.onDevfile(devfile);
    } catch (e) {
      let errorMessage = 'Failed to load devfile.';
      console.warn(errorMessage, e);
      errorMessage += ` ${e}`;
      this.showAlert({
        key: 'load-devfile-failed',
        title: errorMessage,
        variant: AlertVariant.warning,
      });
      throw new Error(e);
    }
  }

  private async onLocationChanged(location: string): Promise<void> {
    // clear devfile select
    this.devfileSelectRef.current?.clearSelect();
    try {
      const devfileContent = await this.props.requestFactoryResolver(location) as che.WorkspaceDevfile;
      this.props.onDevfile(devfileContent);
    } catch (e) {
      this.devfileLocationRef.current?.invalidateInput();
      let errorMessage = 'Failed to resolve or load the devfile.';
      console.warn(errorMessage, e);
      errorMessage += ` ${e}`;
      this.showAlert({
        key: 'load-factory-resolver-failed',
        title: errorMessage,
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
            >
              <FlexItem grow={{ default: 'grow' }} className={styles.templateSelector}>
                <DevfileSelect
                  ref={this.devfileSelectRef}
                  metadata={metadata}
                  onSelect={meta => this.handleDevfileSelect(meta)}
                  onClear={() => this.handleDevfileClear()}
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

const mapStateToProps = (state: AppState) => ({
  devfileRegistries: state.devfileRegistries,
  factoryResolver: state.factoryResolver,
});

const connector = connect(
  mapStateToProps,
  {
    ...DevfileRegistriesStore.actionCreators,
    ...FactoryResolverStore.actionCreators,
  }
);

type MergedProps = ConnectedProps<typeof connector>;
export default connector(DevfileSelectorFormGroup);
