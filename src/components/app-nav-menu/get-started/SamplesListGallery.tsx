import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import * as DevfileStore from '../../../store/Devfiles';
import {
  Brand,
  Card,
  CardBody,
  CardHead,
  CardHeader,
  CardHeadMain,
  Gallery,
} from '@patternfly/react-core';

type SamplesListGalleryProps = {
  devfiles: che.DevfileMetaData[];
  onCardClick: (devfile: string, stackName: string) => void;
  devfileStore: DevfileStore.DevfileState;
} & DevfileStore.ActionCreators;

export class SamplesListGallery extends React.PureComponent<SamplesListGalleryProps> {

  private buildCardsList: () => React.ReactElement[];

  constructor(props: SamplesListGalleryProps) {
    super(props);

    const handleCardClick = async (devfileMeta: che.DevfileMetaData): Promise<void> => {
      const devfile = await this.props.requestDevfile(devfileMeta.links.self);
      this.props.onCardClick(devfile, devfileMeta.displayName);
    };
    this.buildCardsList = (): React.ReactElement[] => {
      return this.props.devfiles.map(devfile => {
        return (
          <Card
            isHoverable
            isCompact
            isSelectable
            key={devfile.displayName}
            onClick={(): Promise<void> => handleCardClick(devfile)}>
            <CardHead>
              <CardHeadMain>
                <Brand
                  src={devfile.icon}
                  alt={devfile.displayName}
                  style={{ height: '64px' }} />
              </CardHeadMain>
            </CardHead>
            <CardHeader>{devfile.displayName}</CardHeader>
            <CardBody>{devfile.description}</CardBody>
          </Card>
        );
      });
    }
  }

  render(): React.ReactElement {
    const cards = this.buildCardsList();
    return (
      <Gallery gutter='md'>
        {cards}
      </Gallery>
    );
  }

}

export default connect(
  (state: AppState) => {
    return { devfileStore: state.devfiles };
  },
  DevfileStore.actionCreators
)(SamplesListGallery);
