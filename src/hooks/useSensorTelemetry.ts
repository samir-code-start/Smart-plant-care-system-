import { useState, useEffect, useCallback, useRef } from 'react';
import type { SensorReading, SensorHistoryPoint } from '../types/telemetry';
import { fetchSensorLatest, fetchSensorHistory } from '../services/api';

const POLL_INTERVAL_MS = 15_000; // 15 seconds

export function useSensorTelemetry(plantId: string | undefined) {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetchSensorLatest(plantId),
        fetchSensorHistory(30),
      ]);

      if (latestRes.success) {
        setLatest(latestRes.data);
        setError(null);
      } else {
        setError(latestRes.error);
      }

      if (historyRes.success) {
        setHistory(historyRes.data.readings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    setLoading(true);
    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { latest, history, loading, error, refresh };
}
