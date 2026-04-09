'use client';

import { useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { fetchAirDistribution } from '@/lib/api';
import { type VAVDevice } from '@/lib/api';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import FloorSelector from '@/components/FloorSelector';
import PageHeader from '@/components/PageHeader';
import { Thermometer, Droplets, Wind } from 'lucide-react';

function DamperBar({ value }: { value: number }) {
  const color = value > 70 ? '#3ecf8e' : value > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 4, backgroundColor: '#2e2e2e', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', backgroundColor: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: '#b4b4b4', minWidth: 36 }}>{value.toFixed(0)}%</span>
    </div>
  );
}

export default function AirDistributionPage() {
  const [activeFloor, setActiveFloor] = useState(1);
  const { data, loading, error, lastUpdated } = usePolling(fetchAirDistribution, { interval: 5000 });

  if (loading) return <div style={{ padding: 32, color: '#898989' }}>Loading Air Distribution...</div>;
  if (error) return <div style={{ padding: 32, color: '#ef4444' }}>⚠ {error}</div>;

  const floorKey = `Floor ${activeFloor}`;
  const floorData = data?.[floorKey];
  const ahu = floorData?.ahu;
  const vavs: VAVDevice[] = floorData?.vavs ?? [];
  const zones = floorData?.zone_environment ?? {};

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader title="Air Distribution" subtitle="AHU / VAV per floor — BACnet/IP" lastUpdated={lastUpdated} />

      <div style={{ padding: '0 32px' }}>
        {/* Floor Selector */}
        <div style={{ marginBottom: 28 }}>
          <FloorSelector floors={[1, 2, 3, 4]} activeFloor={activeFloor} onChange={setActiveFloor} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          {/* AHU Status */}
          <div style={{ backgroundColor: '#171717', border: '1px solid #2e2e2e', borderRadius: 8, padding: '20px' }}>
            <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#898989', marginBottom: 16 }}>
              AHU — Floor {activeFloor}
            </p>
            {ahu ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{ahu.id}</span>
                  <DeviceStatusBadge status={ahu.status_read} alarm={ahu.alarm} />
                </div>
                <div style={{ borderTop: '1px solid #242424', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Thermometer size={9} /> Room Temp
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 400, color: '#fafafa' }}>
                      {ahu.room_temperature?.toFixed(1)}<span style={{ fontSize: 12, color: '#898989', marginLeft: 2 }}>°C</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4 }}>
                      Setpoint
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 400, color: '#3ecf8e' }}>
                      {ahu.setpoint?.toFixed(1)}<span style={{ fontSize: 12, color: '#898989', marginLeft: 2 }}>°C</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Droplets size={9} /> Humidity
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 400, color: '#60a5fa' }}>{ahu.humidity?.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 4 }}>
                      Power
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 400, color: '#f59e0b' }}>{ahu.power?.toFixed(2)} kW</p>
                  </div>
                </div>

                {/* Zone Environment */}
                {Object.entries(zones).length > 0 && (
                  <div style={{ borderTop: '1px solid #242424', paddingTop: 14 }}>
                    <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d4d4d', marginBottom: 10 }}>
                      Zone Environment (IAQ)
                    </p>
                    {Object.entries(zones).map(([zone, env]) => (
                      <div key={zone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#898989' }}>Zone {zone}</span>
                        <span style={{ fontSize: 12, color: '#b4b4b4' }}>
                          {env.temperature.toFixed(1)}°C · {env.humidity.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#4d4d4d', fontSize: 13 }}>No AHU data for this floor</p>
            )}
          </div>

          {/* VAV Grid */}
          <div>
            <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#898989', marginBottom: 16 }}>
              VAV Units — Floor {activeFloor} ({vavs.length} units)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {vavs.map((vav) => (
                <div key={vav.id} style={{ backgroundColor: '#171717', border: '1px solid #2e2e2e', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 12, color: '#fafafa' }}>{vav.id}</span>
                    <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#4d4d4d' }}>Zone {vav.zone}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#4d4d4d' }}>Damper</span>
                      </div>
                      <DamperBar value={vav.damper_position} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#4d4d4d', display: 'flex', alignItems: 'center', gap: 4 }}><Wind size={10} /> Air Flow</span>
                      <span style={{ fontSize: 12, color: '#a78bfa' }}>{vav.air_flow_rate.toFixed(0)} CFM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
