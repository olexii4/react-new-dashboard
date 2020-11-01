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
import { WorkspaceStatus } from '../../services/workspaceStatus';

import styles from '../../components/WorkspaceStatusLabel/WorkspaceStatusLabel.module.css';
import './index.styl';

export const SECTION_THEME = PageSectionVariants.light;

export enum IdeLoaderTabs {
  Progress = 0,
  Logs = 1,
}

type Props = {
  hasError: boolean,
  currentStep: number,
  workspaceName: string;
  workspaceId: string;
  ideUrl?: string;
  callbacks?: {
    showAlert?: (variant: AlertVariant.success | AlertVariant.danger, title: string) => void
  }
};

type State = {
  alertVisible?: boolean;
  activeTabKey?: IdeLoaderTabs;
  stepIdReached?: number;
  currentRequestError?: string;
};

class IdeLoader extends React.PureComponent<Props, State> {
  private alert: { variant?: AlertVariant.success | AlertVariant.danger; title?: string } = {};
  public showAlert: (variant: AlertVariant.success | AlertVariant.danger, title: string, timeDelay?: number) => void;
  private readonly hideAlert: () => void;
  private readonly handleTabClick: (event: any, tabIndex: any) => void;

  private readonly wizardRef: RefObject<any>;

  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      activeTabKey: IdeLoaderTabs.Progress,
      stepIdReached: 1,
      currentRequestError: '',
    };

    this.wizardRef = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = (event: any, tabIndex: any): void => {
      this.setState({ activeTabKey: tabIndex });
      if (this.state.activeTabKey === IdeLoaderTabs.Progress) {
        this.setState({ alertVisible: false });
      }
    };
    // Init showAlert
    let showAlertTimer;
    this.showAlert = (variant: AlertVariant.success | AlertVariant.danger, title: string): void => {
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
      this.props.callbacks.showAlert = (variant: AlertVariant.success | AlertVariant.danger, title: string) => {
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

  private getIcon(id: number): React.ReactNode {
    const { currentStep, hasError } = this.props;
    if (currentStep > id) {
      return (<React.Fragment>
        <CheckCircleIcon className="wizard-icon" color="green" />
      </React.Fragment>);
    } else if (currentStep === id) {
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
    const { workspaceName, currentStep } = this.props;
    return [
      {
        id: 1,
        name: (<React.Fragment>
          {this.getIcon(1)}Initializing workspace
        </React.Fragment>),
      },
      {
        id: 2,
        name: (<React.Fragment>
          {this.getIcon(2)}Waiting for workspace to start
        </React.Fragment>),
        canJumpTo: currentStep >= 2,
      },
      {
        id: 3, name: (<React.Fragment>
          {this.getIcon(3)}Looking for runtime machine which contains IDE
        </React.Fragment>),
        canJumpTo: currentStep >= 3,
      },
      {
        id: 4,
        name: (<React.Fragment>
          {this.getIcon(4)}Open IDE
        </React.Fragment>),
        canJumpTo: currentStep === 4,
      },
    ];
  }

  public render(): React.ReactElement {
    const { workspaceName, workspaceId, ideUrl, hasError } = this.props;
    const { alertVisible } = this.state;

    if (ideUrl) {
      const randVal = Math.floor((Math.random() * 1000000) + 1);
      return (
        <div style={{ height: '100%' }}>
          <iframe className='ide-page-frame' src={`${ideUrl}?uid=${randVal}`} />
        </div>);
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
        <Header workspaceName={workspaceName}
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
