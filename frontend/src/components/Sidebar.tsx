'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Thermometer,
  Wind,
  Zap,
  Building2,
  Activity,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chiller-plant', label: 'Chiller Plant', icon: Thermometer },
  { href: '/air-distribution', label: 'Air Distribution', icon: Wind },
  { href: '/electrical', label: 'Electrical', icon: Zap },
];

const analyticsItems = [
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 220, minHeight: '100vh', backgroundColor: '#0f0f0f', borderRight: '1px solid #242424' }}
      className="flex flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #242424' }}>
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={20} color="#3ecf8e" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.02em' }}>
            IoT BMS
          </span>
        </div>
        <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#898989', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          AltoTech Global
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1" style={{ padding: '12px 0' }}>
        <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#4d4d4d', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 20px 4px' }}>
          Monitoring
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 20px',
                marginLeft: 8,
                marginRight: 8,
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#fafafa' : '#898989',
                backgroundColor: isActive ? '#171717' : 'transparent',
                borderLeft: isActive ? '2px solid #3ecf8e' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#3ecf8e' : '#4d4d4d'} />
              {label}
            </Link>
          );
        })}

        <p style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#4d4d4d', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '16px 20px 4px' }}>
          Analytics
        </p>
        {analyticsItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 20px',
                marginLeft: 8,
                marginRight: 8,
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#fafafa' : '#898989',
                backgroundColor: isActive ? '#171717' : 'transparent',
                borderLeft: isActive ? '2px solid #a78bfa' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#a78bfa' : '#4d4d4d'} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #242424' }}>
        <div className="flex items-center gap-2">
          <Activity size={12} color="#3ecf8e" />
          <span style={{ fontFamily: 'Source Code Pro, monospace', fontSize: 10, color: '#3ecf8e', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            Live
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#4d4d4d', marginTop: 4 }}>
          Sim interval: 5s
        </p>
      </div>
    </aside>
  );
}
