'use client';

import { usePolling } from '@/hooks/usePolling';
import { fetchDashboard } from '@/lib/api';
import StatusCard from '@/components/StatusCard';
import PageHeader from '@/components/PageHeader';
import { Zap, Droplets, Thermometer, Wind, Cloud, RefreshCw } from 'lucide-react';

function IAQBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, backgroundColor: '#2e2e2e', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: '#b4b4b4', minWidth: 40, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, lastUpdated } = usePolling(fetchDashboard, { interval: 5000 });

  if (loading) return (
    <div style={{ padding: 32, color: '#898989', display: 'flex', alignItems: 'center', gap: 8 }}>
      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ padding: 32, color: '#ef4444', fontSize: 14 }}>
      ⚠ Error: {error} — Is the backend running at localhost:8000?
    </div>
  );

  const kpis = data?.building_kpis;
  const iaq = data?.iaq_analytics ?? {};
  const weather = data?.weather;

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader
        title="Building Overview"
        subtitle="4-floor commercial building — real-time IoT monitoring"
        lastUpdated={lastUpdated}
      />

      <div style={{ padding: '0 32px' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatusCard
            title="Total Power"
            value={kpis?.total_power_kw?.toFixed(1) ?? '—'}
            unit="kW"
            icon={Zap}
            iconColor="#f59e0b"
          />
          <StatusCard
            title="Total Energy"
            value={kpis?.total_energy_kwh?.toFixed(0) ?? '—'}
            unit="kWh"
            icon={Zap}
            iconColor="#3ecf8e"
            highlight
          />
          <StatusCard
            title="Cooling Load"
            value={kpis?.total_cooling_rt?.toFixed(1) ?? '—'}
            unit="RT"
            icon={Droplets}
            iconColor="#60a5fa"
          />
          <StatusCard
            title="Efficiency"
            value={kpis?.overall_efficiency_kw_rt?.toFixed(3) ?? '—'}
            unit="kW/RT"
            icon={RefreshCw}
            iconColor="#a78bfa"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
          {/* IAQ Analytics */}
          <div>
            <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#898989', marginBottom: 16 }}>
              IAQ Analytics — Per Floor
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(iaq).map(([floorName, floorData]) => (
                <div key={floorName} style={{ backgroundColor: '#171717', border: '1px solid #2e2e2e', borderRadius: 8, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fafafa' }}>{floorName}</span>
                    <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4d4d4d' }}>
                      2 Sensors
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#4d4d4d', display: 'flex', alignItems: 'center', gap: 4 }}><Thermometer size={10} /> Temp</span>
                        <span style={{ fontSize: 11, color: '#898989' }}>avg {floorData.temperature.avg}°C</span>
                      </div>
                      <IAQBar value={floorData.temperature.avg} max={35} color="#f97316" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#4d4d4d', display: 'flex', alignItems: 'center', gap: 4 }}><Droplets size={10} /> RH</span>
                        <span style={{ fontSize: 11, color: '#898989' }}>avg {floorData.humidity.avg}%</span>
                      </div>
                      <IAQBar value={floorData.humidity.avg} max={100} color="#60a5fa" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#4d4d4d' }}>CO₂</span>
                        <span style={{ fontSize: 11, color: floorData.co2.avg > 1000 ? '#ef4444' : '#898989' }}>avg {floorData.co2.avg} ppm</span>
                      </div>
                      <IAQBar value={floorData.co2.avg} max={1500} color={floorData.co2.avg > 1000 ? '#ef4444' : '#3ecf8e'} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#4d4d4d' }}>PM2.5</span>
                        <span style={{ fontSize: 11, color: floorData.pm25.avg > 35 ? '#f59e0b' : '#898989' }}>avg {floorData.pm25.avg} µg/m³</span>
                      </div>
                      <IAQBar value={floorData.pm25.avg} max={100} color={floorData.pm25.avg > 35 ? '#f59e0b' : '#a78bfa'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Station */}
          <div>
            <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#898989', marginBottom: 16 }}>
              Weather Station
            </p>
            <div style={{ backgroundColor: '#171717', border: '1px solid #2e2e2e', borderRadius: 8, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Cloud size={16} color="#60a5fa" />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fafafa' }}>WS-ROOF</span>
                <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#4d4d4d', textTransform: 'uppercase', letterSpacing: '0.8px', marginLeft: 'auto' }}>
                  Rooftop
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4 }}>
                    Dry Bulb
                  </p>
                  <p style={{ fontSize: 32, fontWeight: 400, color: '#fafafa', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {weather?.drybulb_temperature?.toFixed(1) ?? '—'}
                    <span style={{ fontSize: 16, color: '#898989', marginLeft: 4 }}>°C</span>
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 12, borderTop: '1px solid #242424' }}>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4 }}>
                      <Wind size={9} style={{ display: 'inline', marginRight: 3 }} />Humidity
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 400, color: '#b4b4b4' }}>{weather?.humidity?.toFixed(1) ?? '—'}%</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4 }}>
                      Wet Bulb
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 400, color: '#b4b4b4' }}>{weather?.wetbulb_temperature?.toFixed(1) ?? '—'}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
