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

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  PageSection, PageSectionVariants, Tab, Tabs, Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons/dist/js/icons';
import React, { RefObject } from 'react';
import Header from '../../components/Header';
import LogsTab from '../../components/LogsTab';
import { LoadIdeSteps } from '../../containers/IdeLoader';
import { WorkspaceStatus } from '../../services/workspaceStatus';

import styles from '../../components/WorkspaceStatusLabel/index.module.css';
import './IdeLoader.styl';

export const SECTION_THEME = PageSectionVariants.light;

export enum IdeLoaderTabs {
  Progress = 0,
  Logs = 1,
}

type Props = {
  hasError: boolean,
  currentStep: LoadIdeSteps,
  workspaceName: string;
  workspaceId: string;
  ideUrl?: string;
  callbacks?: {
    showAlert?: (variant: AlertVariant, title: string) => void
  }
};

type State = {
  alertVisible?: boolean;
  activeTabKey?: IdeLoaderTabs;
  currentRequestError?: string;
};

class IdeLoader extends React.PureComponent<Props, State> {
  private alert: { variant?: AlertVariant; title?: string } = {};
  public showAlert: (variant: AlertVariant, title: string, timeDelay?: number) => void;
  private readonly hideAlert: () => void;
  private readonly handleTabClick: (event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: React.ReactText) => void;

  private readonly wizardRef: RefObject<any>;

  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      activeTabKey: IdeLoaderTabs.Progress,
      currentRequestError: '',
    };

    this.wizardRef = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: React.ReactText): void => {
      this.setState({ activeTabKey: tabIndex as IdeLoaderTabs });
      if (this.state.activeTabKey === IdeLoaderTabs.Progress) {
        this.setState({ alertVisible: false });
      }
    };
    // Init showAlert
    let showAlertTimer;
    this.showAlert = (variant: AlertVariant, title: string): void => {
      this.setState({ currentRequestError: title });
      if (this.state.activeTabKey === IdeLoaderTabs.Progress) {
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
    if (current && current.state && current.state.currentStep !== currentStep) {
      current.state.currentStep = currentStep;
    }

    if (!hasError && this.state.currentRequestError) {
      this.setState({ currentRequestError: '' });
    }
  }

  private getIcon(step: LoadIdeSteps): React.ReactNode {
    const { currentStep, hasError } = this.props;
    if (currentStep > step) {
      return (<React.Fragment>
        <CheckCircleIcon className="wizard-icon" color="green" />
      </React.Fragment>);
    } else if (currentStep === step) {
      if (hasError) {
        return <ExclamationCircleIcon className="wizard-icon" color="red" />;
      }
      return (<React.Fragment>
        <InProgressIcon className={`${styles.rotate} wizard-icon`} color="blue" />
      </React.Fragment>);
    }
    return '';
  }

  private getSteps(): WizardStep[] {
    return [
      {
        id: LoadIdeSteps.INITIALIZING,
        name: (<React.Fragment>
          {this.getIcon(LoadIdeSteps.INITIALIZING)}Initializing
        </React.Fragment>),
      },
      {
        id: LoadIdeSteps.START_WORKSPACE,
        name: (<React.Fragment>
          {this.getIcon(LoadIdeSteps.START_WORKSPACE)}Waiting for workspace to start
        </React.Fragment>),
      },
      {
        id: LoadIdeSteps.OPEN_IDE,
        name: (<React.Fragment>
          {this.getIcon(LoadIdeSteps.OPEN_IDE)}Open IDE
        </React.Fragment>),
      },
    ];
  }

  public render(): React.ReactElement {
    const { workspaceName, workspaceId, ideUrl, hasError } = this.props;
    const { alertVisible } = this.state;

    if (ideUrl) {
      return (
        <div style={{ height: '100%' }}>
          <iframe className='ide-page-frame' src={ideUrl} />
        </div>
      );
    }

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
        <PageSection variant={SECTION_THEME} className="ide-loader-tabs">
          <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
            <Tab eventKey={IdeLoaderTabs.Progress} title={IdeLoaderTabs[IdeLoaderTabs.Progress]}>
              {(this.state.currentRequestError) && (
                <Alert
                  style={{ marginTop: '15px' }}
                  variant={AlertVariant.danger} isInline title={this.state.currentRequestError}
                  actionClose={<AlertActionCloseButton
                    onClose={() => this.setState({ currentRequestError: '' })} />}
                />
              )}
              <Wizard
                className="ide-loader-wizard"
                steps={this.getSteps()}
                ref={this.wizardRef}
                footer={('')}
                height={500}
                startAtStep={0}
              />
            </Tab>
            <Tab eventKey={IdeLoaderTabs.Logs} title={IdeLoaderTabs[IdeLoaderTabs.Logs]}>
              <LogsTab workspaceId={workspaceId} />
            </Tab>
          </Tabs>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default IdeLoader;
