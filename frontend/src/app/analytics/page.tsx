'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  fetchChillerHistory,
  fetchPumpHistory,
  fetchCoolingTowerHistory,
  fetchAhuHistory,
  fetchVavHistory,
  fetchIaqHistory,
  fetchWeatherHistory,
  fetchPowerMeterHistory,
  type HistoryPoint,
} from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, Clock, Download } from 'lucide-react';

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = [
  '#3ecf8e', '#60a5fa', '#f59e0b', '#ef4444',
  '#a78bfa', '#f97316', '#ec4899', '#14b8a6',
  '#8b5cf6', '#facc15', '#6ee7b7', '#fb923c',
];

// ─── Time Range Selector ──────────────────────────────────────────────────────
const TIME_RANGES = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface DeviceGroup {
  label: string;
  prefixes: string[];  // device_id prefixes to include
}

interface ChartSection {
  title: string;
  subtitle: string;
  fetchFn: (m: number) => Promise<{ data: HistoryPoint[]; minutes: number }>;
  metrics: { key: string; label: string; unit: string }[];
  deviceGroups?: DeviceGroup[];  // optional grouping for charts with too many devices
}

// ─── Chart Config ─────────────────────────────────────────────────────────────
const SECTIONS: ChartSection[] = [
  {
    title: 'Building Power',
    subtitle: 'Main + floor sub-meters — kW over time',
    fetchFn: fetchPowerMeterHistory,
    metrics: [
      { key: 'power', label: 'Power', unit: 'kW' },
      { key: 'current', label: 'Current', unit: 'A' },
    ],
    deviceGroups: [
      { label: 'All', prefixes: [] },
      { label: 'Main + Chillers', prefixes: ['PM-MAIN', 'PM-CH'] },
      { label: 'Pumps', prefixes: ['PM-CDP', 'PM-CHP'] },
      { label: 'AHUs', prefixes: ['PM-AHU'] },
      { label: 'Cooling Towers', prefixes: ['PM-CT'] },
      { label: 'Floor Meters', prefixes: ['PM-F'] },
    ],
  },
  {
    title: 'Chillers',
    subtitle: 'Power consumption & efficiency per chiller',
    fetchFn: fetchChillerHistory,
    metrics: [
      { key: 'power', label: 'Power', unit: 'kW' },
      { key: 'efficiency', label: 'Efficiency', unit: 'kW/RT' },
      { key: 'cooling_rate', label: 'Cooling', unit: 'RT' },
    ],
  },
  {
    title: 'Pumps',
    subtitle: 'CHW & CDW pump power and frequency',
    fetchFn: fetchPumpHistory,
    metrics: [
      { key: 'power', label: 'Power', unit: 'kW' },
      { key: 'frequency_read', label: 'Frequency', unit: 'Hz' },
    ],
  },
  {
    title: 'Cooling Towers',
    subtitle: 'Fan power and frequency',
    fetchFn: fetchCoolingTowerHistory,
    metrics: [
      { key: 'power', label: 'Power', unit: 'kW' },
      { key: 'frequency_read', label: 'Frequency', unit: 'Hz' },
    ],
  },
  {
    title: 'AHU',
    subtitle: 'Temperature, setpoint, and humidity trends',
    fetchFn: fetchAhuHistory,
    metrics: [
      { key: 'room_temperature', label: 'Room Temp', unit: '°C' },
      { key: 'setpoint', label: 'Setpoint', unit: '°C' },
      { key: 'humidity', label: 'Humidity', unit: '%' },
      { key: 'power', label: 'Power', unit: 'kW' },
    ],
    deviceGroups: [
      { label: 'All', prefixes: [] },
      { label: 'Floor 1', prefixes: ['AHU-F1'] },
      { label: 'Floor 2', prefixes: ['AHU-F2'] },
      { label: 'Floor 3', prefixes: ['AHU-F3'] },
      { label: 'Floor 4', prefixes: ['AHU-F4'] },
    ],
  },
  {
    title: 'VAV Units',
    subtitle: 'Damper position & air flow rate',
    fetchFn: fetchVavHistory,
    metrics: [
      { key: 'damper_position', label: 'Damper', unit: '%' },
      { key: 'air_flow_rate', label: 'Air Flow', unit: 'CFM' },
    ],
    deviceGroups: [
      { label: 'All', prefixes: [] },
      { label: 'Floor 1', prefixes: ['VAV-F1-'] },
      { label: 'Floor 2', prefixes: ['VAV-F2-'] },
      { label: 'Floor 3', prefixes: ['VAV-F3-'] },
      { label: 'Floor 4', prefixes: ['VAV-F4-'] },
    ],
  },
  {
    title: 'IAQ — Indoor Air Quality',
    subtitle: 'Temperature, CO₂, PM2.5, and humidity',
    fetchFn: fetchIaqHistory,
    metrics: [
      { key: 'temperature', label: 'Temperature', unit: '°C' },
      { key: 'humidity', label: 'Humidity', unit: '%' },
      { key: 'co2', label: 'CO₂', unit: 'ppm' },
      { key: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    ],
    deviceGroups: [
      { label: 'All', prefixes: [] },
      { label: 'Floor 1', prefixes: ['IAQ-F1'] },
      { label: 'Floor 2', prefixes: ['IAQ-F2'] },
      { label: 'Floor 3', prefixes: ['IAQ-F3'] },
      { label: 'Floor 4', prefixes: ['IAQ-F4'] },
    ],
  },
  {
    title: 'Weather Station',
    subtitle: 'Outdoor conditions — temperature & humidity',
    fetchFn: fetchWeatherHistory,
    metrics: [
      { key: 'drybulb_temperature', label: 'Dry Bulb', unit: '°C' },
      { key: 'wetbulb_temperature', label: 'Wet Bulb', unit: '°C' },
      { key: 'humidity', label: 'Humidity', unit: '%' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return ts;
  }
}

/** Round an ISO timestamp down to the nearest N-second boundary to group device writes together. */
function roundToInterval(ts: string, intervalSec = 10): string {
  const d = new Date(ts);
  d.setSeconds(Math.floor(d.getSeconds() / intervalSec) * intervalSec, 0);
  return d.toISOString();
}

/** Group raw data by device_id, then pivot to { timestamp, deviceA_metric, deviceB_metric, ... } */
function pivotByDevice(data: HistoryPoint[], metricKey: string): Record<string, unknown>[] {
  const timeMap = new Map<string, Record<string, unknown>>();

  for (const row of data) {
    const ts = roundToInterval(row.timestamp);
    if (!timeMap.has(ts)) {
      timeMap.set(ts, { timestamp: ts, _display: formatTimestamp(ts) });
    }
    const entry = timeMap.get(ts)!;
    const val = row[metricKey];
    entry[`${row.device_id}`] = typeof val === 'number' ? Math.round(val * 1000) / 1000 : val;
  }

  return Array.from(timeMap.values());
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Sort by device name for consistency
  const sorted = [...payload]
    .filter((p) => p.value !== undefined && p.value !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        border: '1px solid #2e2e2e',
        borderRadius: 6,
        padding: '10px 14px',
        fontFamily: 'Source Code Pro, monospace',
        fontSize: 11,
        maxHeight: 260,
        overflowY: sorted.length > 8 ? 'auto' : 'visible',
        minWidth: 160,
      }}
    >
      {/* Timestamp header */}
      <div style={{ color: '#898989', fontSize: 10, marginBottom: 8, borderBottom: '1px solid #242424', paddingBottom: 6 }}>
        {label}
      </div>

      {/* Device list */}
      {sorted.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '2px 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b4b4b4' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {entry.name}
          </span>
          <span style={{ color: '#fafafa', fontWeight: 500 }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            <span style={{ color: '#4d4d4d', marginLeft: 3, fontSize: 9 }}>{unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Single Section Chart ─────────────────────────────────────────────────────
function HistoryChart({
  section,
  minutes,
}: {
  section: ChartSection;
  minutes: number;
}) {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState(section.metrics[0].key);
  const [activeGroup, setActiveGroup] = useState(0); // index into deviceGroups
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await section.fetchFn(minutes);
      setData(result.data);
      hasLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setInitialLoading(false);
    }
  }, [section, minutes]);

  // Reset initial loading when time range changes
  useEffect(() => {
    setInitialLoading(true);
    hasLoaded.current = false;
  }, [minutes]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [load]);

  // Filter data by device group if applicable
  const filteredData = (() => {
    if (!section.deviceGroups || activeGroup === 0) return data; // 0 = "All"
    const group = section.deviceGroups[activeGroup];
    return data.filter((d) =>
      group.prefixes.some((p) => d.device_id.startsWith(p))
    );
  })();

  const chartData = pivotByDevice(filteredData, activeMetric);
  const deviceIds = [...new Set(filteredData.map(d => d.device_id))].sort();
  const metricInfo = section.metrics.find(m => m.key === activeMetric)!;

  const handleDownloadCsv = () => {
    if (chartData.length === 0) return;
    const headers = ['Timestamp', ...deviceIds];
    const rows = chartData.map(row => {
      return [
        row.timestamp,
        ...deviceIds.map(id => row[id] !== undefined && row[id] !== null ? row[id] : '')
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${section.title.replace(/[\s/—]+/g, '_').toLowerCase()}_${activeMetric}_log.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: '#171717', border: '1px solid #2e2e2e', borderRadius: 8, padding: '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 4 }}>{section.title}</h3>
          <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d' }}>
            {section.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#898989' }}>
            {data.length} pts
          </span>
          <button
            onClick={handleDownloadCsv}
            disabled={chartData.length === 0}
            title="Download Data Log (CSV)"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', borderRadius: 4,
              border: '1px solid #2e2e2e', backgroundColor: 'transparent',
              color: chartData.length === 0 ? '#4d4d4d' : '#898989',
              cursor: chartData.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 10, fontFamily: 'Source Code Pro, monospace',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { if (chartData.length > 0) { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.borderColor = '#4d4d4d'; } }}
            onMouseOut={(e) => { if (chartData.length > 0) { e.currentTarget.style.color = '#898989'; e.currentTarget.style.borderColor = '#2e2e2e'; } }}
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: section.deviceGroups ? 8 : 16, flexWrap: 'wrap' }}>
        {section.metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: activeMetric === m.key ? '#3ecf8e' : '#2e2e2e',
              backgroundColor: activeMetric === m.key ? 'rgba(62, 207, 142, 0.1)' : 'transparent',
              color: activeMetric === m.key ? '#3ecf8e' : '#898989',
              fontSize: 11,
              fontFamily: 'Source Code Pro, monospace',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {m.label} ({m.unit})
          </button>
        ))}
      </div>

      {/* Device Group Tabs (if applicable) */}
      {section.deviceGroups && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {section.deviceGroups.map((g, i) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(i)}
              style={{
                padding: '3px 10px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: activeGroup === i ? '#60a5fa' : '#2e2e2e',
                backgroundColor: activeGroup === i ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                color: activeGroup === i ? '#60a5fa' : '#5a5a5a',
                fontSize: 10,
                fontFamily: 'Source Code Pro, monospace',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {initialLoading ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#898989', gap: 8 }}>
          <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Loading...
        </div>
      ) : error ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 12 }}>
          ⚠ {error}
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d4d4d', fontSize: 12 }}>
          No historical data yet — wait for data writer to accumulate records
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
            <XAxis
              dataKey="_display"
              tick={{ fontSize: 10, fill: '#4d4d4d' }}
              axisLine={{ stroke: '#242424' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#4d4d4d' }}
              axisLine={{ stroke: '#242424' }}
              tickLine={false}
              width={50}
              label={{ value: metricInfo.unit, position: 'insideLeft', style: { fontSize: 10, fill: '#4d4d4d' }, offset: 10 }}
            />
            <Tooltip
              content={<CustomChartTooltip unit={metricInfo.unit} />}
              cursor={{ stroke: '#3ecf8e', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {deviceIds.length <= 8 && (
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: 'Source Code Pro, monospace' }}
                iconType="plainline"
              />
            )}
            {deviceIds.map((id, i) => (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                name={id}
                connectNulls
                isAnimationActive={!hasLoaded.current}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [minutes, setMinutes] = useState(30);

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader
        title="Analytics"
        subtitle="Historical trends from SQLite time-series data"
      />

      <div style={{ padding: '0 32px' }}>
        {/* Time Range Selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
          padding: '12px 16px', backgroundColor: '#171717', border: '1px solid #2e2e2e',
          borderRadius: 8, width: 'fit-content',
        }}>
          <Clock size={14} color="#898989" />
          <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 11, color: '#898989', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Time Range
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setMinutes(r.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: minutes === r.value ? '#3ecf8e' : '#2e2e2e',
                  backgroundColor: minutes === r.value ? 'rgba(62, 207, 142, 0.12)' : 'transparent',
                  color: minutes === r.value ? '#3ecf8e' : '#898989',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Row 1 — Power & Chillers (most important) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <HistoryChart section={SECTIONS[0]} minutes={minutes} />
            <HistoryChart section={SECTIONS[1]} minutes={minutes} />
          </div>

          {/* Row 2 — Pumps & Cooling Towers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <HistoryChart section={SECTIONS[2]} minutes={minutes} />
            <HistoryChart section={SECTIONS[3]} minutes={minutes} />
          </div>

          {/* Row 3 — AHU & VAV */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <HistoryChart section={SECTIONS[4]} minutes={minutes} />
            <HistoryChart section={SECTIONS[5]} minutes={minutes} />
          </div>

          {/* Row 4 — IAQ & Weather */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <HistoryChart section={SECTIONS[6]} minutes={minutes} />
            <HistoryChart section={SECTIONS[7]} minutes={minutes} />
          </div>
        </div>
      </div>
    </div>
  );
}
