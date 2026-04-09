import { renderHook, act } from '@testing-library/react';
import { usePolling } from '@/hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('fetches data on initial render', async () => {
    const mockData = { id: 1 };
    const fetchFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => usePolling(fetchFn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('polls data at specified interval', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1 });

    renderHook(() => usePolling(fetchFn, { interval: 5000 }));

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('handles API errors correctly', async () => {
    const errorMsg = 'Failed to fetch';
    const fetchFn = jest.fn().mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => usePolling(fetchFn));

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current.error).toBe(errorMsg);
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('does not poll when enabled is false', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1 });

    renderHook(() => usePolling(fetchFn, { enabled: false }));

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });
});
