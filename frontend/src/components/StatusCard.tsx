import { type LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  highlight?: boolean;
}

export default function StatusCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = '#3ecf8e',
  subtitle,
  highlight = false,
}: StatusCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#171717',
        border: `1px solid ${highlight ? 'rgba(62,207,142,0.3)' : '#2e2e2e'}`,
        borderRadius: 8,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          style={{
            fontFamily: 'Source Code Pro, monospace',
            fontSize: 11,
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: '#898989',
          }}
        >
          {title}
        </p>
        {Icon && <Icon size={16} color={iconColor} />}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span
          style={{
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1,
            color: '#fafafa',
            letterSpacing: '-0.02em',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, color: '#898989', fontWeight: 400 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: 12, color: '#4d4d4d', marginTop: 2 }}>{subtitle}</p>
      )}
    </div>
  );
}
