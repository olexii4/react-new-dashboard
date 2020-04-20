import * as React from 'react';

import './workspace-indicator.styl';

// TODO should move this constants to the separate file
const ERROR = 'ERROR';
const STARTING = 'STARTING';
const RUNNING = 'RUNNING';
const STOPPING = 'STOPPING';

class WorkspaceIndicator extends React.PureComponent<{ status: string | undefined }> {

  public render() {

    if (this.props.status === STARTING || this.props.status === STOPPING) {
      return (
        <span className='workspace-status-indicator'>
          <span className='workspace-status-spinner ng-scope'>
            <div className='spinner'>
              <div className='rect1' /><div className='rect2' /><div className='rect3' />
            </div>
          </span>
        </span>
      );
    }

    const iconClass = (status: string | undefined) => {
      if (status === ERROR) {
        return 'fa fa-circle workspace-status-error';
      }
      if (status === RUNNING) {
        return 'fa fa-circle';
      }
      return 'fa fa-circle-o';
    };

    return (
      <React.Fragment>
        <span className='workspace-status-indicator'><i className={iconClass(this.props.status)} /></span>
      </React.Fragment>
    );
  }
}

export default WorkspaceIndicator;
