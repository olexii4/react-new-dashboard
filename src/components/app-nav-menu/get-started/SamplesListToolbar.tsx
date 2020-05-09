import React, { FormEvent } from 'react';
import Pluralize from 'react-pluralize';
import { TemporaryStorageSwitch } from './TemporaryStorageSwitch';
import {
  TextContent,
  Flex,
  FlexItem,
  FlexModifiers,
  Text,
  TextInput,
} from '@patternfly/react-core';

type SamplesListToolbarProps = {
  persistVolumesDefault: string;
  onTemporaryStorageChange: (temporary: boolean) => void;
  devfiles: che.DevfileMetaData[];
  onSearchValueChange: (filtered: che.DevfileMetaData[]) => void;
};
type SamplesListToolbarState = {
  found: number;
  searchValue: string;
}

export class SamplesListToolbar extends React.PureComponent<SamplesListToolbarProps, SamplesListToolbarState> {
  handleTextInputChange: (value: string, event: FormEvent<HTMLInputElement>) => void;
  buildSearchBox: Function;

  constructor(props) {
    super(props);

    this.state = {
      found: -1,
      searchValue: '',
    };

    this.handleTextInputChange = (value: string): void => {
      this.setState({ searchValue: value });
      value = value.toLowerCase();

      const filtered = this.props.devfiles.filter(devfile =>
        devfile.displayName.toLowerCase().includes(value)
        || devfile.description?.toLowerCase().includes(value));

      this.setState({ found: filtered.length });
      this.props.onSearchValueChange(filtered);
    };
    this.buildSearchBox = (): React.ReactElement => {
      const value = this.state.searchValue;
      return (
        <TextInput value={value ? value : ''} type="search" onChange={this.handleTextInputChange} aria-label="Filter samples list" placeholder="Filter by"/>
      );
    };
  }

  render(): React.ReactElement {
    const found = this.state.found > -1 ? this.state.found : this.props.devfiles.length;

    return (
      <Flex className={'pf-u-m-md pf-u-mb-0 pf-u-mr-0'}>
        <FlexItem>
          {this.buildSearchBox()}
        </FlexItem>
        <FlexItem>
          <TextContent>
            <Text><Pluralize singular={'item'} count={found} zero={'Nothing found'}/></Text>
          </TextContent>
        </FlexItem>
        <FlexItem breakpointMods={[{ modifier: FlexModifiers["align-right"] }]}>
          <TemporaryStorageSwitch
            persistVolumesDefault={this.props.persistVolumesDefault}
            onChange={this.props.onTemporaryStorageChange} />
        </FlexItem>
      </Flex>
    );
  }
}
