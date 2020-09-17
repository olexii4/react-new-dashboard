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
import { connect, ConnectedProps } from 'react-redux';
import { History } from 'history';
import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertActionCloseButton,
  AlertGroup
} from '@patternfly/react-core';

import WorkspaceIndicator from '../../components/workspace/Indicator';
import CheProgress from '../../components/Progress';
import { AppState } from '../../store';
import * as WorkspacesStore from '../../store/Workspaces';
import DevfileEditor, { DevfileEditor as Editor } from '../../components/DevfileEditor';
import { selectIsLoading, selectWorkspaceById } from '../../store/Workspaces/selectors';

import './WorkspaceDetails.styl';

const SECTION_THEME = PageSectionVariants.light;

type Props =
  // selectors
  {
    isLoading: boolean,
    workspace: che.Workspace | null | undefined,
  }
  & { history: History }
  & MappedProps;

type State = {
  activeTabKey: number;
  workspace: che.Workspace | undefined;
  alertVisible: boolean;
  isDevfileValid: boolean;
  hasRequestErrors: boolean; // todo provide error handling
};

class WorkspaceDetails extends React.PureComponent<Props, State> {
  private timeoutId: any;
  private alert: { variant?: 'success' | 'danger'; title?: string } = {};
  private showAlert: (variant: 'success' | 'danger', title: string, timeDelay?: number) => void;
  private hideAlert: () => void;
  private readonly handleTabClick: (event: any, tabIndex: any) => void;
  private readonly cancelChanges: () => void;

  private devfileEditorRef: React.RefObject<Editor>;

  constructor(props: Props) {
    super(props);

    this.state = {
      workspace: this.props.workspace ? Object.assign({}, this.props.workspace) : undefined,
      activeTabKey: 4,
      alertVisible: false,
      isDevfileValid: true,
      hasRequestErrors: false
    };

    // Toggle currently active tab
    this.handleTabClick = (event: any, tabIndex: any): void => {
      this.setState({ activeTabKey: tabIndex });
    };
    this.cancelChanges = (): void => {
      clearTimeout(this.timeoutId);
      this.setState({ workspace: Object.assign({}, this.props.workspace) });
    };
    this.showAlert = (variant: 'success' | 'danger', title: string, timeDelay?: number): void => {
      this.alert = { variant, title };
      this.setState({ alertVisible: true });
      setTimeout(() => {
        this.setState({ alertVisible: false });
      }, timeDelay ? timeDelay : 2000);
    };
    this.hideAlert = (): void => this.setState({ alertVisible: false });
    this.devfileEditorRef = React.createRef<Editor>();
  }

  componentDidUpdate(): void {
    if (
      this.props.workspace &&
      (
        !this.state.workspace ||
        this.isEqualObject(this.props.workspace.devfile, this.state.workspace?.devfile) === false
      )
    ) {
      this.setState({ workspace: this.props.workspace });
      this.updateEditor(this.props.workspace.devfile);
    }
  }

  private updateEditor(devfile: che.WorkspaceDevfile): void {
    this.devfileEditorRef.current?.updateContent(devfile);
    this.setState({ isDevfileValid: true });
  }

  public render(): React.ReactElement {
    const { workspace, alertVisible } = this.state;

    if (this.props.isLoading) {
      return <div>Workspace is loading...</div>;
    }

    if (!workspace) {
      return <div>Workspace not found.</div>;
    }

    const workspaceName = workspace.devfile.metadata.name;

    return (
      <React.Fragment>
        {alertVisible && (
          <AlertGroup isToast>
            <Alert
              variant={this.alert.variant}
              title={this.alert.title}
              actionClose={<AlertActionCloseButton onClose={this.hideAlert} />}
            />
          </AlertGroup>
        )}
        <PageSection variant={SECTION_THEME} className='workspace-details-header'>
          <TextContent>
            <Text component='h1'>
              Workspaces&nbsp;<b>&nbsp;&gt;&nbsp;</b>&nbsp;{workspaceName}&nbsp;
              <WorkspaceIndicator status={workspace.status} />
              <span>{workspace.status}</span>
            </Text>
          </TextContent>
        </PageSection>
        <PageSection variant={SECTION_THEME} className='workspace-details-tabs'>
          <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
            <Tab eventKey={0} title='Overview'>
              <br /><p>Tab 1 section</p>
            </Tab>
            <Tab eventKey={1} title='Projects'>
              <br /><p>Tab 2 section</p>
            </Tab>
            <Tab eventKey={2} title='Plugins'>
              <br /><p>Tab 3 section</p>
            </Tab>
            <Tab eventKey={3} title='Editors'>
              <br /><p>Tab 4 section</p>
            </Tab>
            <Tab eventKey={4} title='Devfile'>
              <CheProgress isLoading={this.props.isLoading} /><br />
              <TextContent className='workspace-details-editor'>
                <Text component='h3' className='label'></Text>
                <DevfileEditor
                  ref={this.devfileEditorRef}
                  devfile={workspace.devfile}
                  decorationPattern='location[ \t]*(.*)[ \t]*$'
                  onChange={(devfile, isValid) => {
                    this.onDevfileChange(workspace, devfile, isValid);
                  }}
                />
                {(!this.state.isDevfileValid || this.state.hasRequestErrors) && (
                  <Button onClick={(): void => {
                    this.updateEditor(workspace.devfile);
                  }} variant='secondary' className='cancel-button'>
                    Cancel
                  </Button>
                )}
              </TextContent>
            </Tab>
          </Tabs>
        </PageSection>
      </React.Fragment>
    );
  }

  private onDevfileChange(workspace: che.Workspace, newDevfile: che.WorkspaceDevfile, isValid: boolean): void {
    this.setState({ isDevfileValid: isValid });
    clearTimeout(this.timeoutId);
    if (!isValid) {
      return;
    }
    if (this.isEqualObject(workspace.devfile, newDevfile)) {
      return;
    }

    this.timeoutId = setTimeout(async () => {
      const newWorkspaceObj = Object.assign({}, workspace);
      newWorkspaceObj.devfile = newDevfile;

      const namespace = newWorkspaceObj.namespace;
      const workspaceName = newWorkspaceObj.devfile.metadata.name;

      try {
        await this.props.updateWorkspace(newWorkspaceObj);
        this.setState({ hasRequestErrors: false });
        this.showAlert('success', 'Workspace has been updated', 2000);

        const pathname = `/workspace/${namespace}/${workspaceName}`;
        this.props.history.replace({ pathname });
      } catch (e) {
        this.setState({ hasRequestErrors: true });
        this.showAlert('danger', e, 10000);
      }
    }, 2000);
  }

  // TODO rework this temporary solution
  private sortObject(o: che.WorkspaceDevfile): che.WorkspaceDevfile {
    return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {} as che.WorkspaceDevfile);
  }

  // TODO rework this temporary solution
  private isEqualObject(a: che.WorkspaceDevfile, b: che.WorkspaceDevfile): boolean {
    return JSON.stringify(this.sortObject(a)) == JSON.stringify(this.sortObject(b));
  }
}

const mapStateToProps = (state: AppState) => ({
  isLoading: selectIsLoading(state),
  workspace: selectWorkspaceById(state),
});

const connector = connect(
  mapStateToProps,
  WorkspacesStore.actionCreators
);

type MappedProps = ConnectedProps<typeof connector>
export default connector(WorkspaceDetails);
