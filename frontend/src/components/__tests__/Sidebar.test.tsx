import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`nav-link-${href}`}>
      {children}
    </a>
  );
});

describe('Sidebar', () => {
  it('renders the branding correctly', () => {
    render(<Sidebar />);
    expect(screen.getByText('IoT BMS')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Chiller Plant')).toBeInTheDocument();
    expect(screen.getByText('Air Distribution')).toBeInTheDocument();
    expect(screen.getByText('Electrical')).toBeInTheDocument();
  });

  it('renders the footer status correctly', () => {
    render(<Sidebar />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('Sim interval: 5s')).toBeInTheDocument();
  });
});
