// API client for FastAPI backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BuildingKPIs {
  total_power_kw: number;
  total_energy_kwh: number;
  total_cooling_rt: number;
  overall_efficiency_kw_rt: number;
}

export interface IAQMetric {
  avg: number;
  min: number;
  max: number;
}

export interface FloorIAQ {
  temperature: IAQMetric;
  humidity: IAQMetric;
  co2: IAQMetric;
  pm25: IAQMetric;
}

export interface Weather {
  id: string;
  drybulb_temperature: number;
  humidity: number;
  wetbulb_temperature: number;
  timestamp: string;
}

export interface DashboardData {
  building_kpis: BuildingKPIs;
  iaq_analytics: Record<string, FloorIAQ>;
  weather: Weather;
}

export interface ChillerDevice {
  id: string;
  protocol: string;
  ip: string;
  port: number;
  device_id: number;
  status_read: boolean;
  alarm: boolean;
  evap_leaving_water_temperature: number;
  evap_entering_water_temperature: number;
  evap_water_flow_rate: number;
  power: number;
  efficiency: number;
  cooling_rate: number;
  timestamp: string;
}

export interface PumpDevice {
  id: string;
  protocol: string;
  ip: string;
  status_read: boolean;
  alarm: boolean;
  frequency_read: number;
  power: number;
  efficiency: number;
  timestamp: string;
}

export interface CoolingTowerDevice {
  id: string;
  protocol: string;
  status_read: boolean;
  alarm: boolean;
  frequency_read: number;
  power: number;
  cells: number;
  timestamp: string;
}

export interface PlantSummary {
  total_cooling_rt: number;
  total_power_kw: number;
  plant_efficiency_kw_rt: number;
}

export interface ChillerPlantData {
  plant_summary: PlantSummary;
  equipments: {
    chillers: Record<string, ChillerDevice>;
    chilled_water_pumps: Record<string, PumpDevice>;
    condenser_water_pumps: Record<string, PumpDevice>;
    cooling_towers: Record<string, CoolingTowerDevice>;
  };
}

export interface AHUDevice {
  id: string;
  floor: number;
  status_read: boolean;
  alarm: boolean;
  room_temperature: number;
  setpoint: number;
  humidity: number;
  power: number;
  timestamp: string;
}

export interface VAVDevice {
  id: string;
  zone: string;
  damper_position: number;
  air_flow_rate: number;
  timestamp: string;
}

export interface FloorAirData {
  ahu: AHUDevice | null;
  vavs: VAVDevice[];
  zone_environment: Record<string, { temperature: number; humidity: number }>;
}

export type AirDistributionData = Record<string, FloorAirData>;

export interface PowerMeter {
  id: string;
  protocol: string;
  coverage: string;
  voltage_LL_average: number;
  current: number;
  power: number;
  energy: number;
  power_factor: number;
  timestamp: string;
}

export interface ElectricalData {
  main_building_power: PowerMeter;
  floor_breakdown: Record<string, PowerMeter>;
  equipment_breakdown: Record<string, PowerMeter>;
}

// ─── API Functions ─────────────────────────────────────────────────────────────
export const fetchDashboard = () => fetchApi<DashboardData>('/api/dashboard');
export const fetchChillerPlant = () => fetchApi<ChillerPlantData>('/api/chiller-plant');
export const fetchAirDistribution = () => fetchApi<AirDistributionData>('/api/air-distribution');
export const fetchElectrical = () => fetchApi<ElectricalData>('/api/electrical');
export const fetchHealth = () => fetchApi<{ status: string }>('/api/health');
