import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertActionCloseButton
} from '@patternfly/react-core';
import WorkspaceIndicator from '../app-nav-menu/workspaces/workspace-indicator/WorkspaceIndicator';
import CheProgress from '../app-common/progress/progress';
import { AppState } from '../../store';
import * as WorkspacesStore from '../../store/Workspaces';
import DevfileEditor from '../app-common/devfile-editor/DevfileEditor';

import './workspace-details.styl';

const SECTION_THEME = PageSectionVariants.light;

type WorkspaceDetailsProps =
  WorkspacesStore.WorkspacesState // ... state we've requested from the Redux store
  & WorkspacesStore.IActionCreators // ... plus action creators we've requested
  & { history: any } // ... plus history
  & RouteComponentProps<{ namespace: string; workspaceName: string }>; // incoming parameters

type WorkspaceDetailsState = { activeTabKey: number; workspace: che.Workspace; alertVisible: boolean; isDevfileValid: boolean; hasRequestErrors: boolean };

class WorkspaceDetails extends React.PureComponent<WorkspaceDetailsProps, WorkspaceDetailsState> {
  private timeoutId: any;
  private cancelFn: Function;
  private alert: { variant?: 'success' | 'danger'; title?: string } = {};
  private showAlert: (variant: 'success' | 'danger', title: string, timeDelay?: number) => void;
  private hideAlert: () => void;
  private readonly handleTabClick: (event: any, tabIndex: any) => void;
  private readonly cancelChanges: (workspaceId: string | undefined) => void;

  constructor(props: WorkspaceDetailsProps) {
    super(props);

    const { namespace, workspaceName } = this.props.match.params;
    const workspace = this.props.workspaces.find(workspace => {
      return workspace.namespace === namespace && workspace.devfile.metadata.name === workspaceName;
    });
    if (!workspace) {
      this.props.history.push('/');
      return;
    }

    this.state = {
      workspace: Object.assign({}, workspace),
      activeTabKey: 4,
      alertVisible: false,
      isDevfileValid: true,
      hasRequestErrors: false
    };

    // Toggle currently active tab
    this.handleTabClick = (event: any, tabIndex: any): void => {
      this.setState({ activeTabKey: tabIndex });
    };
    this.cancelChanges = (workspaceId: string | undefined): void => {
      clearTimeout(this.timeoutId);
      const workspace = this.props.workspaces.find(workspace => {
        return workspace.id === workspaceId;
      });
      if (workspace) {
        this.setState({ workspace: Object.assign({}, workspace) });
      }
    };
    this.showAlert = (variant: 'success' | 'danger', title: string, timeDelay?: number): void => {
      this.alert = { variant, title };
      this.setState({ alertVisible: true });
      setTimeout(() => {
        this.setState({ alertVisible: false });
      }, timeDelay ? timeDelay : 2000);
    };
    this.hideAlert = (): void => this.setState({ alertVisible: false });
  }

  public render(): React.ReactElement {
    const { workspace, alertVisible } = this.state;
    const workspaceName = workspace.devfile.metadata.name;

    const setCallback = (updateFunction: Function): void => {
      this.cancelFn = updateFunction;
    };

    return (
      <React.Fragment>
        {alertVisible && (
          <Alert
            variant={this.alert.variant}
            title={this.alert.title}
            action={<AlertActionCloseButton onClose={this.hideAlert} />}
          />
        )}
        <PageSection variant={SECTION_THEME} className='workspace-details-header'>
          <TextContent>
            <Text component='h1'>
              Workspaces&nbsp;<b>&nbsp;&gt;&nbsp;</b>&nbsp;{workspaceName}&nbsp;
                            <WorkspaceIndicator status={workspace.status} /><span>{workspace.status}</span>
            </Text>
          </TextContent>
        </PageSection>
        <PageSection variant={SECTION_THEME} className='workspace-details-tabs'>
          <Tabs isFilled activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
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
                <Text component='h3' className='label'>Workspace</Text>
                <DevfileEditor devfile={workspace.devfile} setUpdateEditorCallback={setCallback}
                  decorationPattern='location[ \t]*(.*)[ \t]*$'
                  onChange={(devfile: che.WorkspaceDevfile, isValid: boolean): void => {
                    this.onDevfileChange(workspace, devfile, isValid);
                  }} />
                {(!this.state.isDevfileValid || this.state.hasRequestErrors) && (
                  <Button onClick={(): void => {
                    if (this.cancelFn) {
                      this.cancelFn();
                    }
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
    if (!this.isEqualObject(workspace.devfile, newDevfile)) {
      this.timeoutId = setTimeout(() => {
        const newWorkspace = Object.assign({}, workspace);
        newWorkspace.devfile = newDevfile;
        this.props.updateWorkspace(newWorkspace).then((workspace: che.Workspace) => {
          this.setState({ hasRequestErrors: false });
          this.setState({ workspace });
          this.showAlert('success', `Workspace has been updated`, 1000);
          const url = `/workspace/${workspace.namespace}/${workspace.devfile.metadata.name}`;
          this.props.history.replace(url);
        }).catch((error: { data?: { message?: string } }) => {
          this.setState({ hasRequestErrors: true });
          const message = error.data && error.data.message ? error.data.message : 'Unknown error';
          this.showAlert('danger', message, 10000);
        });
      }, 2000);
    }
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

export default connect(
  (state: AppState) => state.workspaces,  // Selects which state properties are merged into the component's props
  WorkspacesStore.actionCreators // Selects which action creators are merged into the component's props
)(WorkspaceDetails);
