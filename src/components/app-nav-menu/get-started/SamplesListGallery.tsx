import React from 'react';
import { connect } from 'react-redux';
import { Gallery } from '@patternfly/react-core';
import { AppState } from '../../../store';
import * as DevfilesStore from '../../../store/Devfiles';
import * as DevfileFiltersStore from '../../../store/DevfileFilters';
import * as DevfileMetadataStore from '../../../store/DevfileMetadata';
import { SampleCard } from './SampleCard';

type SamplesListGalleryProps = {
  metadata: DevfileMetadataStore.State;
  metadataFilter: DevfileFiltersStore.MetadataFilterState;
  onCardClick: (devfile: string, stackName: string) => void;
} & DevfilesStore.ActionCreators;

export class SamplesListGallery extends React.PureComponent<SamplesListGalleryProps> {

  render(): React.ReactElement {
    const metadata = this.props.metadataFilter.found;
    const cards = this.buildCardsList(metadata);
    return (
      <Gallery gutter='md'>
        {cards}
      </Gallery>
    );
  }

  private async fetchDevfile(meta: che.DevfileMetaData): Promise<void> {
    const devfile = await this.props.requestDevfile(meta.links.self);
    this.props.onCardClick(devfile, meta.displayName);
  }

  private buildCardsList(metadata: che.DevfileMetaData[]): React.ReactElement[] {
    return metadata.map(meta => (
      <SampleCard
        key={meta.links.self}
        metadata={meta}
        onClick={(): Promise<void> => this.fetchDevfile(meta)}
      />
    ));
  }

}

export default connect(
  (state: AppState) => ({
    metadataFilter: state.devfileMetadataFilter,
  }), {
  ...DevfilesStore.actionCreators,
}
)(SamplesListGallery);
