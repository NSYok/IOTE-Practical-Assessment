import { type ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  title?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  title,
}: DataTableProps<T>) {
  return (
    <div
      style={{
        backgroundColor: '#171717',
        border: '1px solid #2e2e2e',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {title && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #242424' }}>
          <p
            style={{
              fontFamily: 'Source Code Pro, monospace',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: '#898989',
            }}
          >
            {title}
          </p>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #242424' }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    padding: '10px 16px',
                    textAlign: col.align || 'left',
                    fontFamily: 'Source Code Pro, monospace',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    color: '#4d4d4d',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={String(row[keyField])}
                style={{
                  borderBottom: idx < data.length - 1 ? '1px solid #1a1a1a' : 'none',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {columns.map((col) => {
                  const value = row[col.key as keyof T];
                  return (
                    <td
                      key={String(col.key)}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        color: '#b4b4b4',
                        textAlign: col.align || 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.render ? col.render(value, row) : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#4d4d4d', fontSize: 13 }}>
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
