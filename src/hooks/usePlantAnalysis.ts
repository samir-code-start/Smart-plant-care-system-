import { useState, useCallback } from 'react';
import type { PlantAnalysis, AnalysisRequest } from '../types/ai';
import { requestAnalysis } from '../services/api';

export function usePlantAnalysis() {
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (request: AnalysisRequest) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await requestAnalysis(request);
      if (res.success) {
        setAnalysis(res.data.analysis);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, loading, error, analyze, clearAnalysis };
}
