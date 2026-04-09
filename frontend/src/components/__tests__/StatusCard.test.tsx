import { render, screen } from '@testing-library/react';
import StatusCard from '@/components/StatusCard';
import { Zap } from 'lucide-react';

describe('StatusCard', () => {
  it('renders title and value', () => {
    render(<StatusCard title="Total Power" value={123.4} unit="kW" />);
    expect(screen.getByText('Total Power')).toBeInTheDocument();
    expect(screen.getByText('123.4')).toBeInTheDocument();
    expect(screen.getByText('kW')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatusCard title="Status" value="OK" />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<StatusCard title="Power" value={100} icon={Zap} iconColor="#3ecf8e" />);
    expect(screen.getByText('Power')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatusCard title="Test" value={1} subtitle="Additional info" />);
    expect(screen.getByText('Additional info')).toBeInTheDocument();
  });

  it('renders without unit', () => {
    render(<StatusCard title="Efficiency" value={0.55} />);
    expect(screen.getByText('0.55')).toBeInTheDocument();
  });

  it('formats large numbers with locale formatting', () => {
    render(<StatusCard title="Energy" value={12345} unit="kWh" />);
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });
});
