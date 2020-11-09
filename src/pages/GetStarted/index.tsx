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
import { connect, ConnectedProps } from 'react-redux';
import { load } from 'js-yaml';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { fallback } from '../../App';
import * as WorkspaceStore from '../../store/Workspaces';
import { AppState } from '../../store';
import { AlertItem } from '../../services/types';
import { ROUTE } from '../../route.enum';

const SamplesListTab = React.lazy(() => import('./GetStartedTab'));
const CustomWorkspaceTab = React.lazy(() => import('./CustomWorkspaceTab'));

const GET_STARTED_TAB_KEY = 'get-started';
const CUSTOM_WORKSPACE_TAB_KEY = 'custom-workspace';

type Props = {
  history: History;
}
  & MappedProps;

type State = {
  activeTabKey: string;
  alerts: AlertItem[];
}

export class GetStarted extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    const activeTabKey = this.getActiveTabKey();

    this.state = {
      activeTabKey,
      alerts: [],
    };
  }

  public componentDidUpdate(): void {
    const activeTabKey = this.getActiveTabKey();
    if (this.state.activeTabKey !== activeTabKey) {
      this.setState({ activeTabKey });
    }
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
    const { pathname, search } = this.props.history.location;

    if (search) {
      const searchParam = new URLSearchParams(search.substring(1));
      if (pathname === ROUTE.GET_STARTED && searchParam.get('tab') === CUSTOM_WORKSPACE_TAB_KEY) {
        return CUSTOM_WORKSPACE_TAB_KEY;
      }
    }

    return GET_STARTED_TAB_KEY;
  }

  private async createWorkspace(
    devfile: api.che.workspace.devfile.Devfile,
    stackName: string | undefined,
    infrastructureNamespace: string | undefined,
  ): Promise<void> {
    const attr = stackName ? { stackName } : {};
    let workspace: che.Workspace;
    try {
      workspace = await this.props.createWorkspaceFromDevfile(devfile, undefined, infrastructureNamespace, attr);
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
      this.props.history.push(`/ide/${workspace.namespace}/${workspaceName}`);
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
    this.props.history.push(`${ROUTE.GET_STARTED}?tab=${activeTabKey}`);

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
          <Title headingLevel={'h1'}>{title}</Title>
        </PageSection>
        <PageSection
          variant={PageSectionVariants.light}
          padding={{ default: 'noPadding' }}
          isFilled={false}
        >
          <Tabs
            activeKey={activeTabKey}
            onSelect={(event, tabKey) => this.handleTabClick(event, tabKey)}>
            <Tab eventKey={GET_STARTED_TAB_KEY} title="Get Started">
              <Suspense fallback={fallback}>
                <SamplesListTab
                  onDevfile={(devfileContent: string, stackName: string) => {
                    return this.handleDevfileContent(devfileContent, { stackName });
                  }}
                />
              </Suspense>
            </Tab>
            <Tab eventKey={CUSTOM_WORKSPACE_TAB_KEY} title="Custom Workspace">
              <Suspense fallback={fallback}>
                <CustomWorkspaceTab
                  onDevfile={(devfile: che.WorkspaceDevfile, infrastructureNamespace?: string) => {
                    return this.handleDevfile(devfile, { infrastructureNamespace });
                  }}
                />
              </Suspense>
            </Tab>
          </Tabs>
        </PageSection>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  branding: state.branding,
});

const connector = connect(
  mapStateToProps,
  WorkspaceStore.actionCreators
);

type MappedProps = ConnectedProps<typeof connector>;
export default connector(GetStarted);
