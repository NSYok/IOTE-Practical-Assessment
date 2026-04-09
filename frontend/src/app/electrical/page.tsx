'use client';

import { usePolling } from '@/hooks/usePolling';
import { fetchElectrical } from '@/lib/api';
import { type PowerMeter } from '@/lib/api';
import DataTable from '@/components/DataTable';
import StatusCard from '@/components/StatusCard';
import PageHeader from '@/components/PageHeader';
import { Zap, Activity } from 'lucide-react';

function PowerBar({ power, maxPower }: { power: number; maxPower: number }) {
  const pct = maxPower > 0 ? Math.min((power / maxPower) * 100, 100) : 0;
  const color = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#3ecf8e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 4, backgroundColor: '#2e2e2e', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: '#b4b4b4', minWidth: 50, textAlign: 'right' }}>{power.toFixed(1)} kW</span>
    </div>
  );
}

export default function ElectricalPage() {
  const { data, loading, error, lastUpdated } = usePolling(fetchElectrical, { interval: 5000 });

  if (loading) return <div style={{ padding: 32, color: '#898989' }}>Loading Electrical...</div>;
  if (error) return <div style={{ padding: 32, color: '#ef4444' }}>⚠ {error}</div>;

  const main = data?.main_building_power;
  const floors = Object.values(data?.floor_breakdown ?? {});
  const equipment = Object.values(data?.equipment_breakdown ?? {});
  const maxPower = main?.power ?? 1;

  const floorCols = [
    { key: 'id', label: 'Meter', render: (_: unknown, row: PowerMeter) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{row.id}</span> },
    { key: 'coverage', label: 'Coverage', render: (v: unknown) => <span style={{ fontSize: 12, color: '#b4b4b4' }}>{String(v)}</span> },
    { key: 'voltage_LL_average', label: 'Voltage (V)', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(1) },
    { key: 'current', label: 'Current (A)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#a78bfa' }}>{Number(v).toFixed(1)}</span> },
    {
      key: 'power', label: 'Power', align: 'right' as const, render: (v: unknown, row: PowerMeter) => (
        <PowerBar power={Number(v)} maxPower={maxPower} />
      )
    },
    { key: 'energy', label: 'Energy (kWh)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#3ecf8e' }}>{Number(v).toFixed(1)}</span> },
    { key: 'power_factor', label: 'PF', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(2) },
  ];

  const equipCols = [
    { key: 'id', label: 'Meter', render: (_: unknown, row: PowerMeter) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{row.id}</span> },
    { key: 'coverage', label: 'Equipment', render: (v: unknown) => <span style={{ fontSize: 12, color: '#b4b4b4' }}>{String(v)}</span> },
    { key: 'voltage_LL_average', label: 'V (V)', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(1) },
    { key: 'current', label: 'I (A)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#a78bfa' }}>{Number(v).toFixed(1)}</span> },
    { key: 'power', label: 'kW', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#f59e0b' }}>{Number(v).toFixed(2)}</span> },
    { key: 'energy', label: 'kWh', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#3ecf8e' }}>{Number(v).toFixed(1)}</span> },
    { key: 'power_factor', label: 'PF', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(2) },
  ];

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader title="Electrical Distribution" subtitle="Main meter + floor & equipment sub-meters — Modbus TCP" lastUpdated={lastUpdated} />

      <div style={{ padding: '0 32px' }}>
        {/* Main Meter KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatusCard title="Total Power" value={main?.power?.toFixed(1) ?? '—'} unit="kW" icon={Zap} iconColor="#f59e0b" highlight />
          <StatusCard title="Total Energy" value={main?.energy?.toFixed(0) ?? '—'} unit="kWh" icon={Activity} iconColor="#3ecf8e" />
          <StatusCard title="Voltage L-L" value={main?.voltage_LL_average?.toFixed(1) ?? '—'} unit="V" icon={Zap} iconColor="#a78bfa" />
          <StatusCard title="Current" value={main?.current?.toFixed(1) ?? '—'} unit="A" icon={Activity} iconColor="#60a5fa" />
          <StatusCard title="Power Factor" value={main?.power_factor?.toFixed(3) ?? '—'} icon={Activity} iconColor="#898989" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DataTable columns={floorCols} data={floors} keyField="id" title="Floor Sub-Meters" />
          <DataTable columns={equipCols} data={equipment} keyField="id" title="Equipment Sub-Meters" />
        </div>
      </div>
    </div>
  );
}
