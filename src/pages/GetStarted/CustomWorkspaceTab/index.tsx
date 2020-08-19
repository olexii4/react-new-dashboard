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
import { load } from 'js-yaml';
import {
  Button,
  Form,
  PageSection,
  PageSectionVariants, Tab, TextContent,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import DevfileEditor, { DevfileEditor as Editor } from '../../../components/DevfileEditor';
import * as WorkspaceStore from '../../../store/Workspaces';
import { StorageTypeFormGroup } from './StorageType';
import { WorkspaceNameFormGroup } from './WorkspaceName';
import DevfileSelectorFormGroup from './DevfileSelector';
import InfrastructureNamespaceFormGroup from './InfrastructureNamespace';

type Props = {
  workspaces: WorkspaceStore.WorkspacesState,
  onDevfile: (devfile: che.WorkspaceDevfile, InfrastructureNamespace: string | undefined) => Promise<void>;
};
type State = {
  isTemporary: boolean;
  devfile: che.WorkspaceDevfile;
  namespace?: che.KubernetesNamespace;
  generateName?: string;
  workspaceName: string;
};

export class CustomWorkspaceTab extends React.Component<Props, State> {

  private devfileEditorRef: React.RefObject<Editor>;

  constructor(props: Props) {
    super(props);

    const isTemporary = this.props.workspaces.settings['che.workspace.persist_volumes.default'] === 'false';
    const generateName = 'wksp-';
    const devfile = this.buildInitialDevfile(isTemporary, generateName);

    this.state = {
      isTemporary,
      devfile,
      generateName,
      workspaceName: '',
    };

    this.devfileEditorRef = React.createRef<Editor>();
  }

  private buildInitialDevfile(isTemporary: boolean, generateName: string): che.WorkspaceDevfile {
    const devfile = {
      apiVersion: '1.0.0',
      metadata: {
        generateName,
      },
    } as che.WorkspaceDevfile;

    if (isTemporary) {
      devfile.attributes = {
        persistVolumes: 'false',
      };
    }

    return devfile;
  }

  private handleInfrastructureNamespaceChange(namespace: che.KubernetesNamespace): void {
    this.setState({ namespace });
  }

  private handleWorkspaceNameChange(name: string): void {
    const devfile = this.state.devfile;

    devfile.metadata.name = name;

    this.setState({ devfile });
    this.updateEditor(devfile);
  }

  private handleTemporaryStorageChange(isTemporary: boolean): void {
    const devfile = this.state.devfile;

    if (isTemporary) {
      if (!devfile.attributes) {
        devfile.attributes = {};
      }
      devfile.attributes.persistVolumes = 'false';
    } else {
      if (!devfile.attributes) {
        return;
      }
      delete devfile.attributes.persistVolumes;
      if (Object.keys(devfile.attributes).length === 0) {
        delete devfile.attributes;
      }
    }

    this.setState({ devfile });
    this.updateEditor(devfile);
  }

  private handleNewDevfile(devfileContent: string): void {
    const devfile = load(devfileContent);
    this.setState({ devfile });
    this.updateEditor(devfile);
  }

  private handleDevfileChange(devfile: che.WorkspaceDevfile, isValid: boolean): void {
    if (!isValid) {
      return;
    }

    // temporary storage
    const isTemporary = !!devfile.attributes && devfile.attributes?.persistVolumes === 'false';
    if (isTemporary !== this.state.isTemporary) {
      this.setState({ isTemporary });
    }

    // workspace name
    const workspaceName = devfile.metadata.name || '';
    const generateName = devfile.metadata.generateName;
    if (workspaceName !== this.state.workspaceName || generateName !== this.state.generateName) {
      this.setState({
        workspaceName,
        generateName,
      });
    }
  }

  private updateEditor(devfile: che.WorkspaceDevfile): void {
    this.devfileEditorRef.current?.updateContent(devfile);
  }

  private handleCreate(): Promise<void> {
    return this.props.onDevfile(this.state.devfile, this.state.namespace?.name);
  }

  public render(): React.ReactElement {
    const { devfile, isTemporary, generateName, workspaceName } = this.state;

    return (
      <React.Fragment>
        <PageSection
          variant={PageSectionVariants.light}
        >
          <Form isHorizontal>
            <InfrastructureNamespaceFormGroup
              onChange={(_namespace: che.KubernetesNamespace) => this.handleInfrastructureNamespaceChange(_namespace)}
            />
            <WorkspaceNameFormGroup
              generateName={generateName}
              name={workspaceName}
              onChange={_name => this.handleWorkspaceNameChange(_name)}
            />
            {/*            <StorageTypeFormGroup
              storageType={isTemporary}
              onChange={_isTemporary => this.handleTemporaryStorageChange(_isTemporary)}
            />*/}
          </Form>
        </PageSection>
        <PageSection
          isFilled
          variant={PageSectionVariants.light}
        >
          <Form>
            <DevfileSelectorFormGroup
              onDevfile={devfile => this.handleNewDevfile(devfile)}
            />
          </Form>
        </PageSection>
        <PageSection
          className="workspace-details-editor"
          variant={PageSectionVariants.light}
        >
          <DevfileEditor
            ref={this.devfileEditorRef}
            devfile={devfile}
            decorationPattern='location[ \t]*(.*)[ \t]*$'
            onChange={(devfile, isValid) => this.handleDevfileChange(devfile, isValid)}
          />
        </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <Button
            variant="primary"
            onClick={() => this.handleCreate()}
          >
            Create & Open
          </Button>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default connect(
  (state: AppState) => ({
    workspaces: state.workspaces,
  }),
)(CustomWorkspaceTab);
