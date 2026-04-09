interface DeviceStatusBadgeProps {
  status: boolean;
  alarm?: boolean;
  size?: 'sm' | 'md';
}

export default function DeviceStatusBadge({ status, alarm = false, size = 'sm' }: DeviceStatusBadgeProps) {
  const isAlarm = alarm && status;
  const label = isAlarm ? 'ALARM' : status ? 'RUNNING' : 'STOPPED';
  const color = isAlarm ? '#ef4444' : status ? '#3ecf8e' : '#4d4d4d';
  const bgColor = isAlarm ? 'rgba(239,68,68,0.1)' : status ? 'rgba(62,207,142,0.1)' : 'rgba(77,77,77,0.15)';
  const dotColor = color;
  const fontSize = size === 'sm' ? 10 : 11;
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: bgColor,
        border: `1px solid ${color}30`,
        borderRadius: 9999,
        padding,
        fontFamily: 'Source Code Pro, monospace',
        fontSize,
        fontWeight: 400,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: dotColor,
          animation: status ? 'pulse 2s infinite' : 'none',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
