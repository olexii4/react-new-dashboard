import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {Gallery, PageSection, PageSectionVariants, Text, TextContent} from '@patternfly/react-core';
import {AppState} from '../../store';
import * as WorkspacesStore from '../../store/Workspaces';
import {Debounce} from '../../services/debounce/Debounce';
import {container} from '../../inversify.config';
import DevfileEditor from '../app-common/devfile-editor/DevfileEditor';

import './workspace-details.styl';
import WorkspaceIndicator from "../app-nav-menu/workspaces/workspace-indicator/WorkspaceIndicator";

const SECTION_THEME = PageSectionVariants.light;

type WorkspaceDetailsProps =
    WorkspacesStore.WorkspacesState // ... state we've requested from the Redux store
    & WorkspacesStore.IActionCreators // ... plus action creators we've requested
    & { history: any } // ... plus history
    & RouteComponentProps<{ namespace: string, workspaceName: string }>; // incoming parameters

class WorkspaceDetails extends React.PureComponent<WorkspaceDetailsProps, { workspace?: che.IWorkspace }> {
    private debounce: Debounce;


    constructor(props: WorkspaceDetailsProps) {
        super(props);

        this.debounce = container.get(Debounce);

        const {namespace, workspaceName} = this.props.match.params;
        const workspace = this.props.workspaces.find(workspace => {
            return workspace.namespace === namespace && workspace.devfile.metadata.name === workspaceName;
        });
        if (!workspace) {
            this.props.history.push('/');
        }

        this.state = {workspace};
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
                    <TextContent className='workspace-details-editor'>
                        <Text component='h3' className='label'>Workspace</Text>
                        <DevfileEditor devfile={workspace.devfile}/>
                    </TextContent>
                </PageSection>
            </React.Fragment>
        );
    }
}

export default connect(
    (state: AppState) => state.workspaces,  // Selects which state properties are merged into the component's props
    WorkspacesStore.actionCreators // Selects which action creators are merged into the component's props
)(WorkspaceDetails);
