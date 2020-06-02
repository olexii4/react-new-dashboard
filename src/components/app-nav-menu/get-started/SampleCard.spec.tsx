import React from 'react';
import { render, screen, RenderResult, fireEvent } from '@testing-library/react';
import { SampleCard } from './SampleCard';

describe('Devfile Metadata Card', () => {

  const metadata: che.DevfileMetaData = {
    'displayName': 'Go',
    'description': 'Stack with Go 1.12.10',
    'tags': [
      'Debian',
      'Go'
    ],
    'icon': '/images/go.svg',
    'globalMemoryLimit': '1686Mi',
    'links': {
      'self': '/devfiles/go/devfile.yaml'
    },
  };
  const onCardClick = jest.fn();

  function renderCard(): RenderResult {
    return render(
      <SampleCard
        key={metadata.links.self}
        metadata={metadata}
        onClick={onCardClick}
      />);
  }

  it('should have a correct title in header', () => {
    renderCard();
    const cardHeader = screen.getByText(metadata.displayName);
    expect(cardHeader).toBeTruthy();
  });

  it('should have an icon', () => {
    renderCard();
    const cardIcon = screen.queryByAltText(metadata.displayName);
    expect(cardIcon).toBeTruthy();
  });

  it('should be able to provide the default icon', () => {
    metadata.icon = '';
    const { container } = renderCard();

    const cardIcon = screen.queryByAltText(metadata.displayName);
    expect(cardIcon).toBeFalsy();

    const blankIcon = container.querySelector('.cheico-type-blank');
    expect(blankIcon).toBeTruthy();
  });

  it('should handle "onClick" event', () => {
    renderCard();

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(onCardClick).toHaveBeenCalledWith(metadata);
  });

});
