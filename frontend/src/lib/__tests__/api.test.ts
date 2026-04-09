import { fetchDashboard, fetchChillerPlant, fetchAirDistribution, fetchElectrical } from '@/lib/api';

global.fetch = jest.fn();

const mockFetch = (data: unknown) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

describe('API Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetchDashboard calls correct endpoint', async () => {
    mockFetch({ building_kpis: {}, iaq_analytics: {}, weather: {} });
    await fetchDashboard();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/dashboard',
      expect.any(Object)
    );
  });

  it('fetchChillerPlant calls correct endpoint', async () => {
    mockFetch({ plant_summary: {}, equipments: {} });
    await fetchChillerPlant();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/chiller-plant',
      expect.any(Object)
    );
  });

  it('fetchAirDistribution calls correct endpoint', async () => {
    mockFetch({});
    await fetchAirDistribution();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/air-distribution',
      expect.any(Object)
    );
  });

  it('fetchElectrical calls correct endpoint', async () => {
    mockFetch({ main_building_power: {}, floor_breakdown: {}, equipment_breakdown: {} });
    await fetchElectrical();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/electrical',
      expect.any(Object)
    );
  });

  it('throws error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    await expect(fetchDashboard()).rejects.toThrow('API error: 500 Internal Server Error');
  });

  it('returns parsed JSON data', async () => {
    const mockData = { building_kpis: { total_power_kw: 999 }, iaq_analytics: {}, weather: {} };
    mockFetch(mockData);
    const result = await fetchDashboard();
    expect(result.building_kpis.total_power_kw).toBe(999);
  });
});
