import { render, screen } from '@testing-library/react';
import DataTable from '@/components/DataTable';

describe('DataTable', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value', align: 'right' as const },
  ];

  const data = [
    { id: '1', name: 'Device A', value: 100 },
    { id: '2', name: 'Device B', value: 200 },
  ];

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} keyField="id" />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} keyField="id" />);
    expect(screen.getByText('Device A')).toBeInTheDocument();
    expect(screen.getByText('Device B')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<DataTable columns={columns} data={data} keyField="id" title="Test Table" />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} keyField="id" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('uses custom render function', () => {
    const colsWithRender = [
      { key: 'id', label: 'ID' },
      { key: 'value', label: 'Value', render: (v: unknown) => <span data-testid="custom">{`${v} kW`}</span> },
    ];
    render(<DataTable columns={colsWithRender} data={data} keyField="id" />);
    expect(screen.getAllByTestId('custom')[0]).toHaveTextContent('100 kW');
  });
});
