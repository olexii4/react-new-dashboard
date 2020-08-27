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
import { Button, Form, PageSection, PageSectionVariants, } from '@patternfly/react-core';
import { AppState } from '../../../store';
import DevfileEditor, { DevfileEditor as Editor } from '../../../components/DevfileEditor';
import * as WorkspaceStore from '../../../store/Workspaces';
import StorageTypeFormGroup, { StorageType } from './StorageType/storageType';
import { WorkspaceNameFormGroup } from './WorkspaceName';
import DevfileSelectorFormGroup from './DevfileSelector';
import InfrastructureNamespaceFormGroup from './InfrastructureNamespace';

type Props = {
  workspaces: WorkspaceStore.WorkspacesState,
  onDevfile: (devfile: che.WorkspaceDevfile, InfrastructureNamespace: string | undefined) => Promise<void>;
};
type State = {
  storageType: StorageType;
  devfile: che.WorkspaceDevfile;
  namespace?: che.KubernetesNamespace;
  generateName?: string;
  workspaceName: string;
};

export class CustomWorkspaceTab extends React.Component<Props, State> {

  private devfileEditorRef: React.RefObject<Editor>;

  constructor(props: Props) {
    super(props);

    const devfile = this.buildInitialDevfile();
    const storageType = this.getStorageType(devfile);
    const workspaceName = devfile.metadata.name ? devfile.metadata.name : '';
    const generateName = !workspaceName ? devfile.metadata.generateName : '';
    this.state = { devfile, storageType, generateName, workspaceName };
    this.devfileEditorRef = React.createRef<Editor>();
  }

  private buildInitialDevfile(generateName?: string): che.WorkspaceDevfile {
    const devfile = {
      apiVersion: '1.0.0',
      metadata: {
        generateName: generateName ? generateName : 'wksp-'
      },
    } as che.WorkspaceDevfile;
    if (this.props.workspaces.settings['che.workspace.persist_volumes.default'] === 'false') {
      devfile.attributes = {
        persistVolumes: 'false'
      };
    }
    return devfile;
  }

  private handleInfrastructureNamespaceChange(namespace: che.KubernetesNamespace): void {
    this.setState({ namespace });
  }

  private handleWorkspaceNameChange(workspaceName: string, workspaceDevfile?: che.WorkspaceDevfile): void {
    const devfile = workspaceDevfile ? workspaceDevfile : this.state.devfile;
    if (!devfile) {
      return;
    }
    if (workspaceName) {
      devfile.metadata.name = workspaceName;
      delete devfile.metadata.generateName;
      const generateName = '';
      this.setState({ workspaceName, generateName });
    }
    this.setState({ devfile });
    this.updateEditor(devfile);
  }

  private handleStorageChange(storageType: StorageType, workspaceDevfile?: che.WorkspaceDevfile): void {
    const devfile = workspaceDevfile ? workspaceDevfile : this.state.devfile;
    if (!devfile) {
      return;
    }
    switch (storageType) {
      case StorageType.persistent:
        if (devfile.attributes) {
          delete devfile.attributes.persistVolumes;
          delete devfile.attributes.asyncPersist;
          if (Object.keys(devfile.attributes).length === 0) {
            delete devfile.attributes;
          }
        }
        break;
      case StorageType.ephemeral:
        if (!devfile.attributes) {
          devfile.attributes = {};
        }
        devfile.attributes.persistVolumes = 'false';
        delete devfile.attributes.asyncPersist;
        break;
      case StorageType.async:
        if (!devfile.attributes) {
          devfile.attributes = {};
        }
        devfile.attributes.persistVolumes = 'false';
        devfile.attributes.asyncPersist = 'true';
        break;
    }

    this.setState({ storageType, devfile });
    this.updateEditor(devfile);
  }

  private handleNewDevfile(devfileContent?: che.WorkspaceDevfile): void {
    const devfile = devfileContent ? devfileContent : this.buildInitialDevfile();
    const { storageType, workspaceName } = this.state;

    if (workspaceName) {
      this.handleWorkspaceNameChange(workspaceName, devfile);
    }
    if (storageType) {
      this.handleStorageChange(storageType, devfile);
    }

    if (!workspaceName && !storageType) {
      this.setState({ devfile });
      this.updateEditor(devfile);
    }
  }

  private getStorageType(devfile: che.WorkspaceDevfile): StorageType {
    let storageType: StorageType;
    // storage type
    if (devfile.attributes && devfile.attributes.persistVolumes === 'false') {
      const isAsync = devfile.attributes && devfile.attributes.asyncPersist === 'true';
      if (isAsync) {
        storageType = StorageType.async;
      } else {
        storageType = StorageType.ephemeral;
      }
    } else {
      storageType = StorageType.persistent;
    }
    return storageType;
  }

  private handleDevfileChange(devfile: che.WorkspaceDevfile, isValid: boolean): void {
    if (!isValid) {
      return;
    }
    this.setState({ devfile });
    const storageType = this.getStorageType(devfile);
    if (storageType !== this.state.storageType) {
      this.setState({ storageType });
    }
    const workspaceName = devfile.metadata.name || '';
    if (workspaceName !== this.state.workspaceName) {
      this.setState({ workspaceName });
    }
    const generateName = devfile.metadata.generateName;
    if (generateName !== this.state.generateName) {
      this.setState({ generateName });
    }
  }

  private updateEditor(devfile: che.WorkspaceDevfile): void {
    this.devfileEditorRef.current?.updateContent(devfile);
  }

  private handleCreate(): Promise<void> {
    return this.props.onDevfile(this.state.devfile, this.state.namespace?.name);
  }

  public render(): React.ReactElement {
    const { devfile, storageType, generateName, workspaceName } = this.state;
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
            <StorageTypeFormGroup
              storageType={storageType}
              onChange={_storageType => this.handleStorageChange(_storageType)}
            />
          </Form>
        </PageSection>
        <PageSection
          isFilled
          variant={PageSectionVariants.light}
        >
          <Form>
            <DevfileSelectorFormGroup
              onDevfile={devfile => this.handleNewDevfile(devfile)}
              onClear={() => this.handleNewDevfile()}
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
