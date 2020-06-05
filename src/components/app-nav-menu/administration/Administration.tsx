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
import { Gallery, PageSection, Text, TextContent } from "@patternfly/react-core";

const Administration = (): React.ReactElement => (
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
