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
import { load } from 'js-yaml';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Tab,
  TabContent,
  Tabs,
  Title,
} from '@patternfly/react-core';
import * as BrandingStore from '../../store/Branding';
import * as WorkspaceStore from '../../store/Workspaces';
import { AppState } from '../../store';
import { AlertItem } from '../../services/types';
import { ROUTE } from '../../route.enum';

const SamplesListTab = React.lazy(() => import('./GetStartedTab'));
const CustomWorkspaceTab = React.lazy(() => import('./CustomWorkspaceTab'));

const GET_STARTED_TAB_KEY = '#get-started';
const CUSTOM_WORKSPACE_TAB_KEY = '#custom-workspace';

type Props = {
  branding: BrandingStore.State;
  history: History;
} & WorkspaceStore.ActionCreators;

type State = {
  activeTabKey: string;
  alerts: AlertItem[];
}

export class GetStarted extends React.PureComponent<Props, State> {

  private contentRef1: any;
  private contentRef2: any;

  constructor(props: Props) {
    super(props);

    const activeTabKey = this.getActiveTabKey();
    this.updateHistory(activeTabKey);

    this.state = {
      activeTabKey,
      alerts: [],
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
    if (pathname === ROUTE.GET_STARTED && hash === CUSTOM_WORKSPACE_TAB_KEY) {
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
      this.props.history.replace(ROUTE.TAB_GET_STARTED);
    } else if (tabKey === CUSTOM_WORKSPACE_TAB_KEY
      && historyLocation.hash !== CUSTOM_WORKSPACE_TAB_KEY) {
      this.props.history.replace(ROUTE.TAB_CUSTOM_WORKSPACE);
    }
  }

  private async createWorkspace(
    devfile: che.WorkspaceDevfile,
    stackName: string | undefined,
    infrastructureNamespace: string | undefined,
  ): Promise<void> {
    const attr: { [key: string]: string } = !stackName
      ? {}
      : { stackName };

    let workspace: che.Workspace;
    try {
      workspace = await this.props.createWorkspaceFromDevfile(
        devfile,
        undefined,
        infrastructureNamespace,
        attr,
      );
    } catch (e) {
      const errorMessage = 'Failed to create a workspace';
      this.showAlert({
        key: 'new-workspace-failed',
        variant: AlertVariant.danger,
        title: errorMessage + '.'
      });
      throw new Error(errorMessage + ', \n' + e);
    }

    const workspaceName = workspace.devfile.metadata.name;
    this.showAlert({
      key: 'new-workspace-success',
      variant: AlertVariant.success,
      title: `Workspace ${workspaceName} has been created.`
    });

    // force start for the new workspace
    try {
      await this.props.startWorkspace(`${workspace.id}`);
      this.props.history.push(`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`);
    } catch (error) {
      const errorMessage = `Workspace ${workspaceName} failed to start`;
      this.showAlert({
        key: 'start-workspace-failed',
        variant: AlertVariant.warning,
        title: errorMessage + '.',
      });

      throw new Error(errorMessage + ', \n' + error);
    }
  }

  private handleDevfile(devfile: che.WorkspaceDevfile, attrs: { stackName?: string, infrastructureNamespace?: string }): Promise<void> {
    return this.createWorkspace(devfile, attrs.stackName, attrs.infrastructureNamespace);
  }

  private handleDevfileContent(devfileContent: string, attrs: { stackName?: string, infrastructureNamespace?: string }): Promise<void> {
    try {
      const devfile = load(devfileContent);
      return this.createWorkspace(devfile, attrs.stackName, attrs.infrastructureNamespace);
    } catch (e) {
      const errorMessage = 'Failed to parse the devfile';
      this.showAlert({
        key: 'parse-devfile-failed',
        variant: AlertVariant.danger,
        title: errorMessage + '.'
      });
      throw new Error(errorMessage + ', \n' + e);
    }
  }

  private showAlert(alert: AlertItem): void {
    const alerts = [...this.state.alerts, alert];
    this.setState({ alerts });
  }

  private removeAlert(key: string): void {
    this.setState({ alerts: [...this.state.alerts.filter(al => al.key !== key)] });
  }

  private handleTabClick(event: React.MouseEvent<HTMLElement, MouseEvent>, activeTabKey: React.ReactText): void {
    this.props.history.push(`${ROUTE.GET_STARTED}${activeTabKey}`);

    this.setState({
      activeTabKey: activeTabKey as string,
    });
  }

  render(): React.ReactNode {
    const { alerts, activeTabKey } = this.state;
    const title = this.getTitle();

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
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel={'h1'} >{title}</Title>
        </PageSection>
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <Tabs
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
              <SamplesListTab
                onDevfile={(devfileContent: string, stackName: string) => this.handleDevfileContent(devfileContent, { stackName })}
              />
            </Suspense>
          </TabContent>
          <TabContent eventKey={CUSTOM_WORKSPACE_TAB_KEY}
            id="refTab2Section"
            ref={this.contentRef2}
            aria-label="Custom Workspace Tab"
            hidden={activeTabKey !== CUSTOM_WORKSPACE_TAB_KEY}>
            <Suspense fallback={<div>Loading...</div>}>
              <CustomWorkspaceTab
                onDevfile={(devfile: che.WorkspaceDevfile, infrastructureNamespace?: string) => this.handleDevfile(devfile, { infrastructureNamespace })}
              />
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
  },
  WorkspaceStore.actionCreators,
)(GetStarted);
