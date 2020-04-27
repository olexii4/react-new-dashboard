import React from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  AlertActionCloseButton,
  Brand,
  Card,
  CardBody,
  CardHead,
  CardHeader,
  CardHeadMain,
  Gallery,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import { container } from '../../../inversify.config';
import { Debounce } from '../../../services/debounce/Debounce';
import * as DevfilesRegistryStore from '../../../store/DevfilesRegistry';
import * as WorkspacesStore from '../../../store/Workspaces';
import CheProgress from '../../app-common/progress/progress';

import './samples-list.styl';

// At runtime, Redux will merge together...
type DevfilesRegistryProps =
  {
    devfilesRegistry: DevfilesRegistryStore.DevfilesState;
    workspaces: WorkspacesStore.WorkspacesState;
  }// ... state we've requested from the Redux store
  & WorkspacesStore.IActionCreators // ... plus action creators we've requested
  & { history: any };

export class SamplesList extends React.PureComponent<DevfilesRegistryProps, { alertVisible: boolean }> {
  private debounce: Debounce;
  private alert: { variant?: 'success' | 'danger'; title?: string } = {};
  private showAlert: (variant: 'success' | 'danger', title: string, timeDelay?: number) => void;
  private hideAlert: () => void;

  constructor(props: DevfilesRegistryProps) {
    super(props);

    this.debounce = container.get(Debounce);

    this.state = { alertVisible: false };
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
  }

  public render(): React.ReactElement {
    const { alertVisible } = this.state;
    const { data } = this.props.devfilesRegistry;

    const createWorkspace = (registryUrl: string, devfile: che.DevfileMetaData): void => {
      if (this.debounce.hasDelay() || !devfile.links || !devfile.links.self) {
        return;
      }
      const devfileUrl = registryUrl + devfile.links.self;
      const attr = { stackName: devfile.displayName };
      this.props.createWorkspace(devfileUrl, attr).then((workspace: che.Workspace) => {
        const workspaceName = workspace.devfile.metadata.name;
        this.showAlert('success', `Workspace ${workspaceName} has been created`, 1500);
        // force start for the new workspace
        this.props.startWorkspace(`${workspace.id}`).then(() => {
          this.props.history.push(`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`);
        }).catch((error: { data?: { message?: string } }) => {
          const message = error.data && error.data.message ? error.data.message : 'Unknown error';
          setTimeout(() => {
            this.hideAlert();
            this.showAlert('danger', message);
          }, 1000);
        });
      });
      this.debounce.setDelay();
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
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component='h1'>Select a Sample</Text>
            <Text component='p'>
              Select a sample to create your first workspace.<br />
            </Text>
          </TextContent>
        </PageSection>
        <CheProgress isLoading={this.props.workspaces.isLoading} />
        <PageSection>
          <Gallery gutter='md'>
            {data.map((data: { devfiles: che.DevfileMetaData[]; registryUrl: string }, index: number) => (
              data.devfiles.map((devfile: che.DevfileMetaData, key: number) => (
                <Card isHoverable isCompact isSelectable
                  key={`${index}_${key}`}
                  onClick={(): void => createWorkspace(data.registryUrl, devfile)}>
                  <CardHead>
                    <CardHeadMain>
                      <Brand src={`${data.registryUrl}${devfile.icon}`}
                        alt={devfile.displayName}
                        style={{ height: '64px' }} />
                    </CardHeadMain>
                  </CardHead>
                  <CardHeader>{devfile.displayName}</CardHeader>
                  <CardBody>{devfile.description}</CardBody>
                </Card>
              ))
            ))}
          </Gallery>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default connect(
  (state: AppState) => {
    const { devfilesRegistry, workspaces } = state;
    return { devfilesRegistry, workspaces };
  }, // Selects which state properties are merged into the component's props(devfilesRegistry and workspaces)
  WorkspacesStore.actionCreators // Selects which action creators are merged into the component's props

)(SamplesList);
