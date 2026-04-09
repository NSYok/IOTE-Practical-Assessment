'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: Date | null;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, lastUpdated, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        padding: '32px 32px 0',
        borderBottom: '1px solid #242424',
        marginBottom: 32,
        paddingBottom: 24,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: '#fafafa',
            letterSpacing: '-0.16px',
            lineHeight: 1.33,
            marginBottom: subtitle ? 6 : 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: '#898989', fontWeight: 400 }}>{subtitle}</p>
        )}
        {lastUpdated && (
          <p
            style={{
              fontFamily: 'Source Code Pro, monospace',
              fontSize: 10,
              color: '#4d4d4d',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginTop: 6,
            }}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
