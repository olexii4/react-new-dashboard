import * as React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardBody,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent
} from "@patternfly/react-core";

const Dashboard = () => (
  <React.Fragment>
    <PageSection>
      <TextContent>
        <Text component='h1'>Main title</Text>
      </TextContent>
    </PageSection>
    <PageSection>
      <Gallery gutter='md'>
        <h1>Hello, Dashboard!</h1>
      </Gallery>
    </PageSection>
  </React.Fragment>
);

export default connect()(Dashboard);
