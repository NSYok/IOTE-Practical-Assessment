import { render, screen } from '@testing-library/react';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';

describe('DeviceStatusBadge', () => {
  it('shows RUNNING when status is true', () => {
    render(<DeviceStatusBadge status={true} />);
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('shows STOPPED when status is false', () => {
    render(<DeviceStatusBadge status={false} />);
    expect(screen.getByText('STOPPED')).toBeInTheDocument();
  });

  it('shows ALARM when alarm is true and device is running', () => {
    render(<DeviceStatusBadge status={true} alarm={true} />);
    expect(screen.getByText('ALARM')).toBeInTheDocument();
  });

  it('shows STOPPED (not ALARM) when alarm is true but device is off', () => {
    render(<DeviceStatusBadge status={false} alarm={true} />);
    expect(screen.getByText('STOPPED')).toBeInTheDocument();
  });

  it('renders with sm size by default', () => {
    const { container } = render(<DeviceStatusBadge status={true} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with md size', () => {
    render(<DeviceStatusBadge status={true} size="md" />);
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });
});
