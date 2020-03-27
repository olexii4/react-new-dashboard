import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {PageSection, PageSectionVariants, Text, TextContent, Tabs, Tab} from '@patternfly/react-core';
import {AppState} from '../../store';
import * as WorkspacesStore from '../../store/Workspaces';
import DevfileEditor from '../app-common/devfile-editor/DevfileEditor';

import './workspace-details.styl';
import WorkspaceIndicator from "../app-nav-menu/workspaces/workspace-indicator/WorkspaceIndicator";
import CheProgress from "../app-common/progress/progress";

const SECTION_THEME = PageSectionVariants.light;

type WorkspaceDetailsProps =
    WorkspacesStore.WorkspacesState // ... state we've requested from the Redux store
    & WorkspacesStore.IActionCreators // ... plus action creators we've requested
    & { history: any } // ... plus history
    & RouteComponentProps<{ namespace: string, workspaceName: string }>; // incoming parameters

type WorkspaceDetailsState = { activeTabKey: number, workspace?: che.IWorkspace };

class WorkspaceDetails extends React.PureComponent<WorkspaceDetailsProps, WorkspaceDetailsState> {
    private timeoutId: any;
    private readonly handleTabClick: (event: any, tabIndex: any) => void;


    constructor(props: WorkspaceDetailsProps) {
        super(props);

        const {namespace, workspaceName} = this.props.match.params;
        const workspace = this.props.workspaces.find(workspace => {
            return workspace.namespace === namespace && workspace.devfile.metadata.name === workspaceName;
        });
        if (!workspace) {
            this.props.history.push('/');
        }

        const activeTabKey = 4;
        this.state = {workspace, activeTabKey};

        // Toggle currently active tab
        this.handleTabClick = (event: any, tabIndex: any) => {
            this.setState({activeTabKey: tabIndex});
        };
    }

    public render() {
        const workspace = this.state.workspace!;
        const {namespace, workspaceName} = this.props.match.params;

        return (
            <React.Fragment>
                <PageSection variant={SECTION_THEME} className='workspace-details-header'>
                    <TextContent>
                        <Text component='h1'>
                            Workspaces&nbsp;<b>&nbsp;>&nbsp;</b>&nbsp;{workspaceName}&nbsp;
                            <WorkspaceIndicator status={workspace.status}/><span>{workspace.status}</span>
                        </Text>
                    </TextContent>
                </PageSection>
                <PageSection variant={SECTION_THEME}>
                    <Tabs isFilled activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
                        <Tab eventKey={0} title="Overview">
                            <br/><br/><p>Tab 1 section</p><br/><br/>
                        </Tab>
                        <Tab eventKey={1} title="Projects">
                            <br/><br/><p>Tab 2 section</p><br/><br/>
                        </Tab>
                        <Tab eventKey={2} title="Plugins">
                            <br/><br/><p>Tab 3 section</p><br/><br/>
                        </Tab>
                        <Tab eventKey={3} title="Editors">
                            <br/><br/><p>Tab 4 section</p><br/><br/>
                        </Tab>
                        <Tab eventKey={4} title="Devfile">
                            <CheProgress isLoading={this.props.isLoading}/><br/>
                            <TextContent className='workspace-details-editor'>
                                <Text component='h3' className='label'>Workspace</Text>
                                <DevfileEditor devfile={workspace.devfile}
                                               onChange={(devfile: che.IWorkspaceDevfile, isValid: boolean) => {
                                                   this.onChange(workspace, devfile, isValid);
                                               }}/>
                            </TextContent>
                        </Tab>
                    </Tabs>
                </PageSection>
            </React.Fragment>
        );
    }

    private onChange(workspace: che.IWorkspace, newDevfile: che.IWorkspaceDevfile, isValid: boolean): void {
        clearTimeout(this.timeoutId);
        if (!isValid) {
            return;
        }
        if (!this.isEqualObject(workspace.devfile, newDevfile)) {
            this.timeoutId = setTimeout(() => {
                const newWorkspace = Object.assign({}, workspace);
                newWorkspace.devfile = newDevfile;
                this.props.updateWorkspace(newWorkspace);
            }, 2000);
        }
    }

    // TODO rework this temporary solution
    private sortObject(o: che.IWorkspaceDevfile) {
        return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    }

    // TODO rework this temporary solution
    private isEqualObject(a: che.IWorkspaceDevfile, b: che.IWorkspaceDevfile) {
        return JSON.stringify(this.sortObject(a)) == JSON.stringify(this.sortObject(b));
    }
}

export default connect(
    (state: AppState) => state.workspaces,  // Selects which state properties are merged into the component's props
    WorkspacesStore.actionCreators // Selects which action creators are merged into the component's props
)(WorkspaceDetails);
