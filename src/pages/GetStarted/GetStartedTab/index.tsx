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
import { connect } from 'react-redux';
import {
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import * as WorkspacesStore from '../../../store/Workspaces';
import CheProgress from '../../../components/Progress';
import { SamplesListHeader } from './SamplesListHeader';
import SamplesListToolbar from './SamplesListToolbar';
import SamplesListGallery from './SamplesListGallery';

// At runtime, Redux will merge together...
type Props = {
  onDevfile: (devfileContent: string, stackName: string) => Promise<void>;
} & {
  workspaces: WorkspacesStore.WorkspacesState;
}// ... state we've requested from the Redux store
  & WorkspacesStore.ActionCreators; // ... plus action creators we've requested;
type State = {
  temporary: boolean;
};

export class SamplesListTab extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      temporary: false,
    };

  }

  private handleTemporaryStorageChange(temporary: boolean): void {
    this.setState({ temporary });
  }

  private handleSampleCardClick(devfileContent: string, stackName: string): Promise<void> {
    return this.props.onDevfile(devfileContent, stackName);
  }

  public render(): React.ReactElement {
    const isLoading = this.props.workspaces.isLoading;
    const persistVolumesDefault = this.props.workspaces.settings['che.workspace.persist_volumes.default'];

    return (
      <React.Fragment>
        <PageSection
          variant={PageSectionVariants.light}>
          <SamplesListHeader />
          <SamplesListToolbar
            persistVolumesDefault={persistVolumesDefault}
            onTemporaryStorageChange={temporary => this.handleTemporaryStorageChange(temporary)} />
        </PageSection>
        <CheProgress isLoading={isLoading} />
        <PageSection variant={PageSectionVariants.default}>
          <SamplesListGallery onCardClick={(devfileContent, stackName) => this.handleSampleCardClick(devfileContent, stackName)} />
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
