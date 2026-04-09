import { render, screen, fireEvent } from '@testing-library/react';
import FloorSelector from '@/components/FloorSelector';

describe('FloorSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all floor buttons', () => {
    render(<FloorSelector floors={[1, 2, 3, 4]} activeFloor={1} onChange={mockOnChange} />);
    expect(screen.getByText('Floor 1')).toBeInTheDocument();
    expect(screen.getByText('Floor 2')).toBeInTheDocument();
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
    expect(screen.getByText('Floor 4')).toBeInTheDocument();
  });

  it('calls onChange when a floor button is clicked', () => {
    render(<FloorSelector floors={[1, 2, 3, 4]} activeFloor={1} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Floor 2'));
    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  it('applies active style to the active floor', () => {
    render(<FloorSelector floors={[1, 2, 3, 4]} activeFloor={3} onChange={mockOnChange} />);
    const activeBtn = screen.getByText('Floor 3');
    expect(activeBtn).toHaveStyle({ backgroundColor: '#171717' });
  });

  it('renders with custom floor list', () => {
    render(<FloorSelector floors={[1, 2]} activeFloor={1} onChange={mockOnChange} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
