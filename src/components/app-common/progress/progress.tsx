import * as React from 'react';
import {
  Progress,
  ProgressMeasureLocation,
  ProgressSize
} from '@patternfly/react-core';

import './progress.styl';

class CheProgress extends React.PureComponent<{ isLoading: boolean }, { progressVal: number }> {
  private intervalId: any;
  private readonly onProgressInc: () => void;

  constructor(props: any) {
    super(props);

    this.state = { progressVal: 0 };

    this.onProgressInc = (): void => {
      const progressVal = this.state.progressVal < 100 ? this.state.progressVal + 5 : 0;
      this.setState({ progressVal });
    };
  }

  private updateProgressInterval(): void {
    if (this.props.isLoading) {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          if (!this.props.isLoading && this.state.progressVal === 0) {
            if (this.intervalId) {
              clearInterval(this.intervalId);
              this.intervalId = undefined;
            }
            return;
          }
          this.onProgressInc();
        }, 20);
      }
    }
  }

  // This method is called when the component is first added to the document
  public componentDidMount(): void {
    this.updateProgressInterval();
  }

  // This method is called when the route parameters change
  public componentDidUpdate(): void {
    this.updateProgressInterval();
  }

  // This method is called when the component is removed from the document
  componentWillUnmount(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public render(): React.ReactElement {
    const { progressVal } = this.state;

    return (
      <span className='progress-line'>
        {this.props.isLoading || this.state.progressVal !== 0 ?
          (<Progress value={progressVal}
            size={ProgressSize.sm}
            measureLocation={ProgressMeasureLocation.none} />) : ''}</span>
    );
  }

}

export default CheProgress;
