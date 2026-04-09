import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/PageHeader';

describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Main Title" />);
    expect(screen.getByText('Main Title')).toBeInTheDocument();
  });

  it('renders subtitle correctly when provided', () => {
    render(<PageHeader title="Main Title" subtitle="Subtitle Text" />);
    expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Main Title" />);
    const subtitle = screen.queryByText('Subtitle Text');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('renders last updated timestamp correctly when provided', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    render(<PageHeader title="Main Title" lastUpdated={date} />);
    // Depends on locale, so just checking if the text "Last updated" exists
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader
        title="Main Title"
        actions={<button data-testid="action-btn">Action</button>}
      />
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });
});
