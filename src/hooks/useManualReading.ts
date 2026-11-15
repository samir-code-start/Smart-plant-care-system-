import { useState, useCallback, useEffect } from 'react';
import type { ManualReading, ManualReadingInput, MoistureStatus } from '../types/telemetry';
import { submitManualReading, fetchManualHistory } from '../services/api';

export function useManualReading(plantId: string | undefined) {
  const [readings, setReadings] = useState<ManualReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    try {
      const res = await fetchManualHistory(plantId, 20);
      if (res.success) {
        setReadings(res.data.readings);
        setError(null);
      } else {
        setError(res.error);
      }
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const submit = useCallback(
    async (moistureStatus: MoistureStatus, growthStage: string, notes?: string) => {
      if (!plantId) return;
      setSubmitting(true);
      setSuccessMessage(null);
      setError(null);

      const input: ManualReadingInput = {
        plant_id: plantId,
        growth_stage: growthStage,
        moisture_status: moistureStatus,
        notes,
      };

      try {
        const res = await submitManualReading(input);
        if (res.success) {
          setSuccessMessage('Manual reading recorded successfully');
          // Refresh history after successful submit
          await loadHistory();
        } else {
          setError(res.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit reading');
      } finally {
        setSubmitting(false);
      }
    },
    [plantId, loadHistory]
  );

  return { readings, loading, submitting, error, successMessage, submit, loadHistory };
}
