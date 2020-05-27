import React from 'react';
import { connect } from 'react-redux';
import { load } from 'js-yaml';
import {
  Alert,
  AlertActionCloseButton,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import { container } from '../../../inversify.config';
import { Debounce } from '../../../services/debounce/Debounce';
import * as WorkspacesStore from '../../../store/Workspaces';
import CheProgress from '../../app-common/progress/progress';
import { SamplesListHeader } from './SamplesListHeader';
import SamplesListToolbar from './SamplesListToolbar';
import SamplesListGallery from './SamplesListGallery';

// At runtime, Redux will merge together...
type DevfilesMetadataProps =
  {
    workspaces: WorkspacesStore.WorkspacesState;
  }// ... state we've requested from the Redux store
  & WorkspacesStore.ActionCreators // ... plus action creators we've requested
  & { history: any };
type SamplesListTabState = {
  alertVisible: boolean;
  temporary: boolean;
};

export class SamplesListTab extends React.PureComponent<DevfilesMetadataProps, SamplesListTabState> {
  private debounce: Debounce;
  private alert: { variant?: 'success' | 'danger'; title?: string } = {};
  private showAlert: (variant: 'success' | 'danger', title: string, timeDelay?: number) => void;
  private hideAlert: () => void;

  private onTemporaryStorageChanged: (temporary: boolean) => void;
  private onSampleCardClicked: (devfile: string, stackName: string) => void;


  constructor(props: DevfilesMetadataProps) {
    super(props);

    this.debounce = container.get(Debounce);

    this.state = {
      alertVisible: false,
      temporary: false,
    };

    this.showAlert = (variant: 'success' | 'danger', title: string, timeDelay?: number): void => {
      this.alert = { variant, title };
      this.setState({ alertVisible: true });
      this.debounce.setDelay(timeDelay);
    };
    this.hideAlert = (): void => this.setState({ alertVisible: false });

    this.debounce.subscribe(isDebounceDelay => {
      if (!isDebounceDelay) {
        this.hideAlert();
      }
    });

    this.onTemporaryStorageChanged = (temporary): void => {
      this.setState({ temporary, })
    }
    this.onSampleCardClicked = (devfileContent: string, stackName: string): void => {
      this.createWorkspace(devfileContent, stackName);
    }
  }

  private async createWorkspace(devfileContent: string, stackName: string): Promise<void> {
    if (this.debounce.hasDelay()) {
      return;
    }
    const attr = { stackName };

    const devfile: che.WorkspaceDevfile = load(devfileContent);
    const workspace = await this.props.createWorkspaceFromDevfile(
      devfile,
      undefined,
      undefined,
      attr,
    );

    const workspaceName = workspace.devfile.metadata.name;
    this.showAlert('success', `Workspace ${workspaceName} has been created`, 1500);
    // force start for the new workspace
    try {
      await this.props.startWorkspace(`${workspace.id}`);
      this.props.history.push(`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`);
    } catch (error) {
      const message = error.data && error.data.message
        ? error.data.message
        : 'Workspace ${workspaceName} failed to start.';
        this.showAlert('danger', message, 5000);
    }
    this.debounce.setDelay();
  }

  public render(): React.ReactElement {
    const { alertVisible } = this.state;

    const isLoading = this.props.workspaces.isLoading;
    const persistVolumesDefault = this.props.workspaces.settings["che.workspace.persist_volumes.default"];

    return (
      <React.Fragment>
        {alertVisible && (
          <Alert
            variant={this.alert.variant}
            title={this.alert.title}
            action={<AlertActionCloseButton onClose={this.hideAlert} />}
          />
        )}
        <PageSection
          variant={PageSectionVariants.light}
          className={'pf-u-pt-xs'}>
          <SamplesListHeader />
          <SamplesListToolbar
            persistVolumesDefault={persistVolumesDefault}
            onTemporaryStorageChange={this.onTemporaryStorageChanged} />
        </PageSection>
        <CheProgress isLoading={isLoading} />
        <PageSection variant={PageSectionVariants.default}>
          <SamplesListGallery onCardClick={this.onSampleCardClicked} />
        </PageSection>
      </React.Fragment>
    );
  }
}

export default connect(
  (state: AppState) => ({
    workspaces: state.workspaces,
  }), // Selects which state properties are merged into the component's props(devfileMetadata and workspaces)
  WorkspacesStore.actionCreators, // Selects which action creators are merged into the component's props
)(SamplesListTab);
