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
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Gallery,
  Title,
} from '@patternfly/react-core';
import { AppState } from '../../../store';
import * as DevfileFiltersStore from '../../../store/DevfileFilters';
import * as DevfileRegistriesStore from '../../../store/DevfileRegistries';
import { SampleCard } from './SampleCard';
import { SearchIcon } from '@patternfly/react-icons';

type SamplesListGalleryProps = {
  metadataFilter: DevfileFiltersStore.MetadataFilterState;
  onCardClick: (devfileContent: string, stackName: string) => void;
}
  & DevfileRegistriesStore.ActionCreators
  & DevfileFiltersStore.ActionCreators;

export class SamplesListGallery extends React.PureComponent<SamplesListGalleryProps> {

  render(): React.ReactElement {
    const metadata = this.props.metadataFilter.found;
    const cards = this.buildCardsList(metadata);

    if (cards.length) {
      return (
        <Gallery gutter='md'>
          {cards}
        </Gallery>
      );
    }

    return this.buildEmptyState();
  }

  private async fetchDevfile(meta: che.DevfileMetaData): Promise<void> {
    const devfile = await this.props.requestDevfile(meta.links.self);
    this.props.onCardClick(devfile, meta.displayName);
  }

  private buildCardsList(metadata: che.DevfileMetaData[] = []): React.ReactElement[] {
    return metadata.map(meta => (
      <SampleCard
        key={meta.links.self}
        metadata={meta}
        onClick={(): Promise<void> => this.fetchDevfile(meta)}
      />
    ));
  }

  private buildEmptyState(): React.ReactElement {
    return (
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title size='lg'>
          No results found
          </Title>
        <EmptyStateBody>
          No results match the filter criteria. Clear filter to show results.
          </EmptyStateBody>
        <EmptyStatePrimary>
          <Button
            variant='link'
            onClick={(): void => this.props.showAll()}>
            Clear filter
            </Button>
        </EmptyStatePrimary>
      </EmptyState>
    );
  }

}

export default connect(
  (state: AppState) => ({
    metadataFilter: state.devfileMetadataFilter,
  }), {
  ...DevfileRegistriesStore.actionCreators,
  ...DevfileFiltersStore.actionCreators,
}
)(SamplesListGallery);
