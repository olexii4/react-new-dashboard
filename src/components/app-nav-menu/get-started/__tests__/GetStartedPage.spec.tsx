import React from 'react';
import { createHashHistory } from 'history';
import { render, screen } from '@testing-library/react';
import { GetStartedPage } from '../GetStartedPage';

jest.mock('../SamplesListTab', () => {
  return function DummyTab(): React.ReactElement {
      return <span>Samples List Tab Content</span>;
  };
});

describe('Get Started page', () => {

  let masthead: HTMLElement;

  beforeEach(() => {
    const history = createHashHistory();
    const branding = {
      branding: {
        branding: {
          branding: {
            name: 'test'
          }
        }
      }
    };
    render(<GetStartedPage branding={branding} history={history} />);

    masthead = screen.getByRole('heading');
  });

  it('should have correct masthead when Get Started tab is active', () => {
    const getStartedTabButton = screen.getByRole('button', { name: 'Get Started' });
    getStartedTabButton.click();

    expect(masthead.textContent?.startsWith('Getting Started with'));
  });

  it('should have correct masthead when Custom Workspace tab is active', () => {
    const customWorkspaceTabButton = screen.getByRole('button', { name: 'Custom Workspace' });
    customWorkspaceTabButton.click();

    expect(masthead.textContent?.startsWith('Create Custom Workspace'));
  });

});
