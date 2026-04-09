'use client';

import { usePolling } from '@/hooks/usePolling';
import { fetchChillerPlant } from '@/lib/api';
import DataTable from '@/components/DataTable';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import StatusCard from '@/components/StatusCard';
import PageHeader from '@/components/PageHeader';
import { type ChillerDevice, type PumpDevice, type CoolingTowerDevice } from '@/lib/api';
import { Droplets, Zap, RefreshCw } from 'lucide-react';

export default function ChillerPlantPage() {
  const { data, loading, error, lastUpdated } = usePolling(fetchChillerPlant, { interval: 5000 });

  if (loading) return <div style={{ padding: 32, color: '#898989' }}>Loading Chiller Plant...</div>;
  if (error) return <div style={{ padding: 32, color: '#ef4444' }}>⚠ {error}</div>;

  const summary = data?.plant_summary;
  const chillers = Object.values(data?.equipments?.chillers ?? {});
  const chwp = Object.values(data?.equipments?.chilled_water_pumps ?? {});
  const cdwp = Object.values(data?.equipments?.condenser_water_pumps ?? {});
  const cts = Object.values(data?.equipments?.cooling_towers ?? {});

  const chillerCols = [
    { key: 'id', label: 'ID', render: (_: unknown, row: ChillerDevice) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{row.id}</span> },
    { key: 'status_read', label: 'Status', render: (_: unknown, row: ChillerDevice) => <DeviceStatusBadge status={row.status_read} alarm={row.alarm} /> },
    { key: 'evap_leaving_water_temperature', label: 'CHW Supply (°F)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#60a5fa' }}>{Number(v).toFixed(2)}</span> },
    { key: 'evap_entering_water_temperature', label: 'CHW Return (°F)', align: 'right' as const, render: (v: unknown) => <span>{Number(v).toFixed(2)}</span> },
    { key: 'evap_water_flow_rate', label: 'Flow (GPM)', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(0) },
    { key: 'power', label: 'Power (kW)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#f59e0b' }}>{Number(v).toFixed(1)}</span> },
    { key: 'cooling_rate', label: 'Cooling (RT)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#3ecf8e' }}>{Number(v).toFixed(1)}</span> },
    { key: 'efficiency', label: 'Efficiency (kW/RT)', align: 'right' as const, render: (v: unknown) => Number(v).toFixed(3) },
  ];

  const pumpCols = [
    { key: 'id', label: 'ID', render: (_: unknown, row: PumpDevice) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{row.id}</span> },
    { key: 'status_read', label: 'Status', render: (_: unknown, row: PumpDevice) => <DeviceStatusBadge status={row.status_read} alarm={row.alarm} /> },
    { key: 'protocol', label: 'Protocol', render: (v: unknown) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#898989', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{String(v)}</span> },
    { key: 'frequency_read', label: 'Freq (Hz)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#a78bfa' }}>{Number(v).toFixed(1)}</span> },
    { key: 'power', label: 'Power (kW)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#f59e0b' }}>{Number(v).toFixed(2)}</span> },
  ];

  const ctCols = [
    { key: 'id', label: 'ID', render: (_: unknown, row: CoolingTowerDevice) => <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{row.id}</span> },
    { key: 'status_read', label: 'Status', render: (_: unknown, row: CoolingTowerDevice) => <DeviceStatusBadge status={row.status_read} alarm={row.alarm} /> },
    { key: 'cells', label: 'Cells', align: 'right' as const },
    { key: 'frequency_read', label: 'Freq (Hz)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#a78bfa' }}>{Number(v).toFixed(1)}</span> },
    { key: 'power', label: 'Power (kW)', align: 'right' as const, render: (v: unknown) => <span style={{ color: '#f59e0b' }}>{Number(v).toFixed(2)}</span> },
  ];

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader title="Chiller Plant" subtitle="3 × 500 RT Chillers + Pumps + Cooling Towers" lastUpdated={lastUpdated} />

      <div style={{ padding: '0 32px' }}>
        {/* Plant Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatusCard title="Total Cooling" value={summary?.total_cooling_rt?.toFixed(1) ?? '—'} unit="RT" icon={Droplets} iconColor="#60a5fa" highlight />
          <StatusCard title="Plant Power" value={summary?.total_power_kw?.toFixed(1) ?? '—'} unit="kW" icon={Zap} iconColor="#f59e0b" />
          <StatusCard title="Plant Efficiency" value={summary?.plant_efficiency_kw_rt?.toFixed(3) ?? '—'} unit="kW/RT" icon={RefreshCw} iconColor="#3ecf8e" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DataTable columns={chillerCols} data={chillers} keyField="id" title="Chillers — BACnet/IP" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <DataTable columns={pumpCols} data={chwp} keyField="id" title="Chilled Water Pumps (CHWP)" />
            <DataTable columns={pumpCols} data={cdwp} keyField="id" title="Condenser Water Pumps (CDWP)" />
          </div>
          <DataTable columns={ctCols} data={cts} keyField="id" title="Cooling Towers — Modbus TCP" />
        </div>
      </div>
    </div>
  );
}
