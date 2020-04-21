import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { container } from '../../../../inversify.config';
import { Debounce } from '../../../../services/debounce/Debounce';

import './delete-workspace.styl';

// TODO should move this constant to the separate file
const STOPPED = 'STOPPED';

type DeleteWorkspaceProps = { workspaceId: string; status: string; deleteWorkspace: Function }; // incoming parameters

class DeleteWorkspace extends React.PureComponent<DeleteWorkspaceProps, { isDebounceDelay: boolean }> {
  private debounce: Debounce;

  constructor(props: DeleteWorkspaceProps) {
    super(props);

    this.debounce = container.get(Debounce);
    this.debounce.subscribe(isDebounceDelay => {
      this.setState({ isDebounceDelay })
    });
  }

  // This method is called when the component is removed from the document
  componentWillUnmount(): void {
    this.debounce.unsubscribeAll();
  }

  private isDisabled = (): boolean => {
    return this.debounce.hasDelay() || this.props.status !== STOPPED;
  };

  public render(): React.ReactElement {

    return (
      <span className={this.isDisabled() ?
        'disabled-delete-workspace' :
        'delete-workspace'}
        onClick={(e): void => {
          e.stopPropagation();
          this.onActionClick();
        }}>
        <Tooltip entryDelay={200} exitDelay={200} content='Delete Workspace'>
          <i className='fa fa-trash'>&nbsp;</i>
        </Tooltip>
      </span>
    );
  }

  private onActionClick(): void {
    if (this.isDisabled()) {
      return;
    }
    this.props.deleteWorkspace(this.props.workspaceId);
    this.debounce.setDelay();
  }
}

export default DeleteWorkspace;
