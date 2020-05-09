import React from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  AlertActionCloseButton,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import { container } from '../../../inversify.config';
import { Debounce } from '../../../services/debounce/Debounce';
import * as DevfilesRegistryStore from '../../../store/DevfilesRegistry';
import * as WorkspacesStore from '../../../store/Workspaces';
import CheProgress from '../../app-common/progress/progress';
import { SamplesListHeader } from './SamplesListHeader';
import { SamplesListToolbar } from './SamplesListToolbar';
import SamplesListGallery from './SamplesListGallery';
import { load } from 'js-yaml';

// At runtime, Redux will merge together...
type DevfilesRegistryProps =
  {
    devfilesRegistry: DevfilesRegistryStore.DevfilesState;
    workspaces: WorkspacesStore.WorkspacesState;
  }// ... state we've requested from the Redux store
  & WorkspacesStore.ActionCreators // ... plus action creators we've requested
  & { history: any };
type SamplesListTabState = {
  alertVisible: boolean;
  devfiles: che.DevfileMetaData[];
  filtered: che.DevfileMetaData[] | undefined;
  temporary: boolean;
};

export class SamplesListTab extends React.PureComponent<DevfilesRegistryProps, SamplesListTabState> {
  private debounce: Debounce;
  private alert: { variant?: 'success' | 'danger'; title?: string } = {};
  private showAlert: (variant: 'success' | 'danger', title: string, timeDelay?: number) => void;
  private hideAlert: () => void;

  private onSearchValueChanged: (filtered: che.DevfileMetaData[]) => void;
  private onTemporaryStorageChanged: (temporary: boolean) => void;
  private onSampleCardClicked: (devfile: string, stackName: string) => void;

  private buildDevfilesList: (data: any) => che.DevfileMetaData[];
  private devfiles: che.DevfileMetaData[] = [];

  constructor(props: DevfilesRegistryProps) {
    super(props);

    this.debounce = container.get(Debounce);

    this.state = {
      alertVisible: false,
      filtered: undefined,
      devfiles: [],
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

    // todo provide proper interface for allRegistriesData
    this.buildDevfilesList = (allRegistriesData: Array<{ devfiles: che.DevfileMetaData[]; registryUrl: string }>): che.DevfileMetaData[] => {
      if (this.devfiles.length > 0) {
        return this.devfiles;
      }
      this.devfiles = allRegistriesData
        .reduce((allDevfiles, registryData) => {
          registryData.devfiles.forEach(devfile => {
            devfile.icon = new URL(devfile.icon, registryData.registryUrl).toString();
            devfile.links.self = new URL(devfile.links.self, registryData.registryUrl).toString();
          });
          allDevfiles = allDevfiles.concat(registryData.devfiles);
          return allDevfiles;
        }, [] as che.DevfileMetaData[]);
      return this.devfiles;
    };

    this.onSearchValueChanged = (filtered: che.DevfileMetaData[]): void => {
      this.setState({ filtered, });
    }
    this.onTemporaryStorageChanged = (temporary): void => {
      this.setState({ temporary, })
    }
    this.onSampleCardClicked = (devfile: string, stackName: string): void => {
      this.createWorkspace(devfile, stackName);
    }
  }

  private async createWorkspace(devfile: string, stackName: string): Promise<void> {
    if (this.debounce.hasDelay()) {
      return;
    }
    const attr = { stackName };

    const devfileObj: che.WorkspaceDevfile = load(devfile);
    const workspace = await this.props.createWorkspaceFromDevfile(
      devfileObj,
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

    const devfiles = this.buildDevfilesList(this.props.devfilesRegistry.data);
    const filtered = !this.state.filtered ? devfiles : this.state.filtered;
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
            onTemporaryStorageChange={this.onTemporaryStorageChanged}
            devfiles={devfiles}
            onSearchValueChange={this.onSearchValueChanged}
          ></SamplesListToolbar>
        </PageSection>
        <CheProgress isLoading={isLoading} />
        <PageSection variant={PageSectionVariants.default}>
          <SamplesListGallery
            devfiles={filtered}
            onCardClick={this.onSampleCardClicked}
          ></SamplesListGallery>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default connect(
  (state: AppState) => {
    const { devfilesRegistry, devfiles, workspaces } = state;
    return { devfilesRegistry, devfiles, workspaces };
  }, // Selects which state properties are merged into the component's props(devfilesRegistry and workspaces)
  WorkspacesStore.actionCreators, // Selects which action creators are merged into the component's props
)(SamplesListTab);
