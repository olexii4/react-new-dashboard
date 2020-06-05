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

import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import {
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabContent,
  Title,
} from '@patternfly/react-core';
import { BrandingState } from '../../../store/Branding';
import { AppState } from '../../../store';

const SamplesListTab = React.lazy(() => import('./SamplesListTab'));

type GetStartedPageProps = {
  branding: BrandingState;
} & { history: any };

type GetStartedPageState = {
  activeTabKey: string | number;
}

export class GetStartedPage extends React.PureComponent<GetStartedPageProps, GetStartedPageState> {

  private contentRef1: any;
  private contentRef2: any;
  private getTitle: () => string;

  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 0
    };

    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = this.handleTabClick.bind(this);

    const productName = (this.props.branding.branding.branding as any).name;
    const titles = [
      `Getting Started with ${productName}`,
      'Create Custom Workspace',
    ];
    this.getTitle = (): string => {
      const tabIndex = parseInt(this.state.activeTabKey.toString(), 10) || 0;
      return titles[tabIndex || 0];
    };
  }

  handleTabClick(event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: number | string): void {
    this.setState({
      activeTabKey: tabIndex
    });
  }

  render(): React.ReactNode {
    const activeTabKey = this.state.activeTabKey;
    const title = this.getTitle();
    return (
      <React.Fragment>
        <PageSection variant={PageSectionVariants.light}>
          <Title size="2xl">{title}</Title>
        </PageSection>
        <PageSection variant={PageSectionVariants.light} noPadding={true}>
          <Tabs isFilled
            activeKey={activeTabKey}
            onSelect={this.handleTabClick}>
            <Tab eventKey={0}
              title="Get Started"
              tabContentId="refTab1Section"
              tabContentRef={this.contentRef1} />
            <Tab eventKey={1}
              title="Custom Workspace"
              tabContentId="refTab2Section"
              tabContentRef={this.contentRef2} />
          </Tabs>
        </PageSection>
        <div>
          <TabContent eventKey={0}
            id="refTab1Section"
            ref={this.contentRef1}
            aria-label="Tab item 1">
            <Suspense fallback={<div>Loading...</div>}>
              <SamplesListTab history={this.props.history} />
            </Suspense>
          </TabContent>
          <TabContent eventKey={1}
            id="refTab2Section"
            ref={this.contentRef2}
            aria-label="Tab item 2"
            hidden>
            Tab 2 section
          </TabContent>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  (state: AppState) => {
    const { branding } = state;
    return { branding };
  }
)(GetStartedPage);
