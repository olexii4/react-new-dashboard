import * as React from 'react';
import { connect } from 'react-redux';
import { Gallery, PageSection, Text, TextContent } from "@patternfly/react-core";

const Administration = () => (
  <React.Fragment>
    <PageSection>
      <TextContent>
        <Text component='h1'>Main administration title</Text>
      </TextContent>
    </PageSection>
    <PageSection>
      <Gallery gutter='md'>
        <h1>Hello, Administration!</h1>
      </Gallery>
    </PageSection>
  </React.Fragment>
);

export default connect()(Administration);
