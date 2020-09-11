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

import { connect, ConnectedProps } from 'react-redux';
import React from 'react';
import Pluralize from 'react-pluralize';
import {
  TextContent,
  Flex,
  FlexItem,
  Text,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import TemporaryStorageSwitch from './TemporaryStorageSwitch';
import * as DevfileFiltersStore from '../../../store/DevfileFilters';
import { AppState } from '../../../store';

type SamplesListToolbarProps =
  MappedProps
  & {
    persistVolumesDefault: string;
    onTemporaryStorageChange: (temporary: boolean) => void;
  };
type SamplesListToolbarState = {
  searchValue: string;
}

export class SamplesListToolbar extends React.PureComponent<SamplesListToolbarProps, SamplesListToolbarState> {
  handleTextInputChange: TextInputProps['onChange'];
  buildSearchBox: (searchValue: string) => React.ReactElement;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
    };

    this.handleTextInputChange = (searchValue): void => {
      this.setState({ searchValue });
      this.props.setFilter(searchValue);
    };
    this.buildSearchBox = (searchValue: string): React.ReactElement => (
      <TextInput value={searchValue} type="search" onChange={this.handleTextInputChange} aria-label="Filter samples list" placeholder="Filter by" />
    );

  }

  componentWillUnmount(): void {
    this.props.showAll();
  }

  render(): React.ReactElement {
    const searchValue = this.props.metadataFilter.filter?.search || '';
    const foundCount = this.props.metadataFilter.found.length;

    return (
      <Flex className={'pf-u-m-md pf-u-mb-0 pf-u-mr-0'}>
        <FlexItem>
          {this.buildSearchBox(searchValue)}
        </FlexItem>
        <FlexItem>
          <TextContent>
            <Text>
              {this.buildCount(foundCount, searchValue)}
            </Text>
          </TextContent>
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <TemporaryStorageSwitch
            persistVolumesDefault={this.props.persistVolumesDefault}
            onChange={this.props.onTemporaryStorageChange} />
        </FlexItem>
      </Flex>
    );
  }

  private buildCount(foundCount: number, searchValue: string): React.ReactElement {
    return searchValue === ''
      ? <span></span>
      : (<Pluralize
        singular={'item'}
        count={foundCount}
        zero={'Nothing found'}
        data-testid='toolbar-results-count'
      />);
  }

}

const mapStateToProps = (state: AppState) => ({
  metadataFilter: state.devfileMetadataFilter,
});

const connector = connect(
  mapStateToProps,
  DevfileFiltersStore.actionCreators,
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(SamplesListToolbar);
