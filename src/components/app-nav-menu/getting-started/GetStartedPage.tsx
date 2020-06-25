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
import { History } from 'history';
import { connect } from 'react-redux';
import {
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabContent,
  Title,
} from '@patternfly/react-core';
import * as BrandingStore from '../../../store/Branding';
import { AppState } from '../../../store';

const SamplesListTab = React.lazy(() => import('./get-started-tab/SamplesListTab'));
const CustomWorkspaceTab = React.lazy(() => import('./custom-workspace-tab/CustomWorkspaceTab'));

const PATH = '/get-started';
const GET_STARTED_TAB_KEY = '#get-started';
const CUSTOM_WORKSPACE_TAB_KEY = '#custom-workspace';

type Props = {
  branding: BrandingStore.State;
} & { history: History };

type State = {
  activeTabKey: string;
}

export class GetStartedPage extends React.PureComponent<Props, State> {

  private contentRef1: any;
  private contentRef2: any;

  constructor(props) {
    super(props);

    const activeTabKey = this.getActiveTabKey();
    this.updateHistory(activeTabKey);

    this.state = {
      activeTabKey
    };

    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();
  }

  private getTitle(): string {
    const productName = this.props.branding.data.name;
    const titles = {
      [GET_STARTED_TAB_KEY]: `Getting Started with ${productName}`,
      [CUSTOM_WORKSPACE_TAB_KEY]: 'Create Custom Workspace',
    };
    return titles[this.state.activeTabKey];
  }

  private getActiveTabKey(): string {
    const { pathname, hash } = this.props.history.location;
    if (pathname === PATH && hash === CUSTOM_WORKSPACE_TAB_KEY) {
      return CUSTOM_WORKSPACE_TAB_KEY;
    }

    return GET_STARTED_TAB_KEY;
  }

  private updateHistory(tabKey: string): void {
    const historyLocation = this.props.history.location;
    if (historyLocation.pathname === '/') {
      return;
    }

    if (tabKey === GET_STARTED_TAB_KEY
      && historyLocation.hash !== GET_STARTED_TAB_KEY) {
      this.props.history.replace(`${PATH}#${GET_STARTED_TAB_KEY}`);
    } else if (tabKey === CUSTOM_WORKSPACE_TAB_KEY
      && historyLocation.hash !== CUSTOM_WORKSPACE_TAB_KEY) {
      this.props.history.replace(`${PATH}#${CUSTOM_WORKSPACE_TAB_KEY}`);
    }
  }

  private handleTabClick(event: React.MouseEvent<HTMLElement, MouseEvent>, activeTabKey: React.ReactText): void {
    this.props.history.push(`${PATH}${activeTabKey}`);

    this.setState({
      activeTabKey: activeTabKey as string,
    });
  }

  render(): React.ReactNode {
    const activeTabKey = this.state.activeTabKey;
    const title = this.getTitle();

    return (
      <React.Fragment>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel={'h1'} >{title}</Title>
        </PageSection>
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <Tabs isFilled
            activeKey={activeTabKey}
            onSelect={(event, tabKey) => this.handleTabClick(event, tabKey)}>
            <Tab eventKey={GET_STARTED_TAB_KEY}
              title="Get Started"
              tabContentId="refTab1Section"
              tabContentRef={this.contentRef1} />
            <Tab eventKey={CUSTOM_WORKSPACE_TAB_KEY}
              title="Custom Workspace"
              tabContentId="refTab2Section"
              tabContentRef={this.contentRef2} />
          </Tabs>
        </PageSection>
        <div>
          <TabContent eventKey={GET_STARTED_TAB_KEY}
            id="refTab1Section"
            ref={this.contentRef1}
            aria-label="Get Started Tab"
            hidden={activeTabKey !== GET_STARTED_TAB_KEY}>
            <Suspense fallback={<div>Loading...</div>}>
              <SamplesListTab history={this.props.history} />
            </Suspense>
          </TabContent>
          <TabContent eventKey={CUSTOM_WORKSPACE_TAB_KEY}
            id="refTab2Section"
            ref={this.contentRef2}
            aria-label="Custom Workspace Tab"
            hidden={activeTabKey !== CUSTOM_WORKSPACE_TAB_KEY}>
            <Suspense fallback={<div>Loading...</div>}>
              <CustomWorkspaceTab />
            </Suspense>
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
