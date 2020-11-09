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

import { CheckCircleIcon } from '@patternfly/react-icons';
import { ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons/dist/js/icons';
import React, { RefObject } from 'react';
import {
  PageSection,
  PageSectionVariants,
  Tabs,
  Tab,
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Wizard, WizardStep,
} from '@patternfly/react-core';
import Header from '../../components/Header';
import { LoadFactorySteps } from '../../containers/FactoryLoader';
import { WorkspaceStatus } from '../../services/workspaceStatus';
import LogsTab from '../../components/LogsTab';

import styles from '../../components/WorkspaceStatusLabel/index.module.css';
import './FactoryLoader.styl';

const SECTION_THEME = PageSectionVariants.light;

export enum LoadFactoryTabs {
  Progress = 0,
  Logs = 1,
}

type Props = {
  hasError: boolean,
  currentStep: LoadFactorySteps,
  workspaceName: string;
  workspaceId: string;
  devfileLocationInfo?: string;
  callbacks?: {
    showAlert?: (variant: AlertVariant, title: string) => void
  }
};

type State = {
  alertVisible?: boolean;
  activeTabKey?: LoadFactoryTabs;
  currentRequestError?: string;
};

class FactoryLoader extends React.PureComponent<Props, State> {
  private alert: { variant?: AlertVariant; title?: string } = {};
  public showAlert: (variant: AlertVariant, title: string, timeDelay?: number) => void;
  private readonly hideAlert: () => void;
  private readonly handleTabClick: (event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: React.ReactText) => void;

  private readonly wizardRef: RefObject<any>;

  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      activeTabKey: LoadFactoryTabs.Progress,
      currentRequestError: '',
    };

    this.wizardRef = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: React.ReactText): void => {
      this.setState({ activeTabKey: tabIndex as LoadFactoryTabs });
      if (this.state.activeTabKey === LoadFactoryTabs.Progress) {
        this.setState({ alertVisible: false });
      }
    };
    // Init showAlert
    let showAlertTimer;
    this.showAlert = (variant: AlertVariant, title: string): void => {
      this.setState({ currentRequestError: title });
      if (this.state.activeTabKey === LoadFactoryTabs.Progress) {
        return;
      }
      this.alert = { variant, title };
      this.setState({ alertVisible: true });
      if (showAlertTimer) {
        clearTimeout(showAlertTimer);
      }
      showAlertTimer = setTimeout(() => {
        this.setState({ alertVisible: false });
      }, variant === AlertVariant.success ? 2000 : 10000);
    };
    this.hideAlert = (): void => this.setState({ alertVisible: false });
    // Prepare showAlert as a callback
    if (this.props.callbacks && !this.props.callbacks.showAlert) {
      this.props.callbacks.showAlert = (variant: AlertVariant, title: string) => {
        this.showAlert(variant, title);
      };
    }
  }

  public componentDidUpdate(): void {
    const { currentStep, hasError } = this.props;

    const current = this.wizardRef.current;
    if (current && current.state && current.state.currentStep !== currentStep && !hasError) {
      current.state.currentStep = currentStep;
    }

    if (!hasError && this.state.currentRequestError) {
      this.setState({ currentRequestError: '' });
    }
  }

  private getIcon(step: LoadFactorySteps, className = ''): React.ReactNode {
    const { currentStep, hasError } = this.props;
    if (currentStep > step) {
      return (<React.Fragment>
        <CheckCircleIcon className={className} color="green" />
      </React.Fragment>);
    } else if (currentStep === step) {
      if (hasError) {
        return <ExclamationCircleIcon className={className} color="red" />;
      }
      return (<React.Fragment>
        <InProgressIcon className={`${styles.rotate} ${className}`} color="blue" />
      </React.Fragment>);
    }
    return '';
  }

  private getSteps(): WizardStep[] {
    const { currentStep, workspaceName, devfileLocationInfo, hasError } = this.props;

    const getTitle = (step: LoadFactorySteps, title: string, iconClass?: string) => {
      let className = '';
      if (currentStep === step) {
        className = hasError ? 'error' : 'progress';
      }
      return (
        <React.Fragment>
          {this.getIcon(step, iconClass)}
          <span className={className}>{title}</span>
        </React.Fragment>
      );
    };

    return [
      {
        id: LoadFactorySteps.INITIALIZING,
        name: getTitle(
          LoadFactorySteps.INITIALIZING,
          'Initializing',
          'wizard-icon'),
        canJumpTo: currentStep >= LoadFactorySteps.INITIALIZING,
      },
      {
        name: getTitle(
          LoadFactorySteps.LOOKING_FOR_DEVFILE,
          'Looking for devfile',
          'wizard-icon'),
        steps: [
          {
            id: LoadFactorySteps.APPLYING_DEVFILE,
            name: getTitle(
              LoadFactorySteps.APPLYING_DEVFILE,
              devfileLocationInfo ?
                `Found ${devfileLocationInfo}, applying it` :
                'File devfile.yaml is not found in repository root. Default environment will be applied'
            ),
            canJumpTo: currentStep >= LoadFactorySteps.APPLYING_DEVFILE,
          },
          {
            id: LoadFactorySteps.CREATE_WORKSPACE,
            name: getTitle(
              LoadFactorySteps.CREATE_WORKSPACE,
              `Creating a new workspace ${workspaceName}`),
            canJumpTo: currentStep >= LoadFactorySteps.CREATE_WORKSPACE,
          },
        ],
      },
      {
        id: LoadFactorySteps.START_WORKSPACE,
        name: getTitle(
          LoadFactorySteps.START_WORKSPACE,
          'Waiting for workspace to start',
          'wizard-icon'),
        canJumpTo: currentStep >= LoadFactorySteps.START_WORKSPACE,
      },
      {
        id: LoadFactorySteps.OPEN_IDE,
        name: getTitle(
          LoadFactorySteps.OPEN_IDE,
          'Open IDE',
          'wizard-icon'),
        canJumpTo: currentStep >= LoadFactorySteps.OPEN_IDE,
      },
    ];
  }

  public render(): React.ReactElement {
    const { workspaceName, workspaceId, hasError, currentStep } = this.props;
    const { alertVisible } = this.state;

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
        <Header title={`Starting workspace ${workspaceName}`}
          status={hasError ? WorkspaceStatus[WorkspaceStatus.ERROR] : WorkspaceStatus[WorkspaceStatus.STARTING]} />
        <PageSection variant={SECTION_THEME} className="load-factory-tabs">
          <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
            <Tab eventKey={LoadFactoryTabs.Progress} title={LoadFactoryTabs[LoadFactoryTabs.Progress]}>
              {(this.state.currentRequestError) && (
                <Alert
                  style={{ marginTop: '15px' }}
                  variant={AlertVariant.danger} isInline title={this.state.currentRequestError}
                  actionClose={<AlertActionCloseButton
                    onClose={() => this.setState({ currentRequestError: '' })} />}
                />
              )}
              <Wizard
                className="load-factory-wizard"
                steps={this.getSteps()}
                ref={this.wizardRef}
                footer={(<span />)}
                height={500}
                startAtStep={currentStep}
              />
            </Tab>
            <Tab eventKey={LoadFactoryTabs.Logs} title={LoadFactoryTabs[LoadFactoryTabs.Logs]}>
              <LogsTab workspaceId={workspaceId} />
            </Tab>
          </Tabs>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default FactoryLoader;
