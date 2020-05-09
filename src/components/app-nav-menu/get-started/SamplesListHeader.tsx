import React from 'react';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';

const TITLE = 'Select a Sample';
const DESCRIPTION = 'Select a sample to create your first workspace';

export class SamplesListHeader extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render(): React.ReactElement {
    return (
      <TextContent className={'pf-u-m-md pf-u-mt-0'}>
        <Text component={TextVariants.h4}>{TITLE}</Text>
        <Text component={TextVariants.small}>{DESCRIPTION}</Text>
      </TextContent>
    );
  }
}
