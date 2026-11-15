// API service layer — fetch wrappers for all backend endpoints

import type { ManualReadingInput, ManualReading, SensorReading, SensorHistoryPoint } from '../types/telemetry';
import type { AnalysisRequest, PlantAnalysis, ChatRequest } from '../types/ai';

const API_BASE = '/api';

// --- Helper ---
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      return { success: false, error: json.error || `Request failed (${res.status})` };
    }

    return { success: true, data: json.data ?? json };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// --- Sensor Endpoints ---

export async function fetchSensorLatest(plantId?: string) {
  const params = plantId ? `?plant_id=${encodeURIComponent(plantId)}` : '';
  return apiFetch<SensorReading>(`${API_BASE}/sensor-latest${params}`);
}

export async function fetchSensorHistory(results = 30) {
  return apiFetch<{ channel_id: string; count: number; readings: SensorHistoryPoint[] }>(
    `${API_BASE}/sensor-history?results=${results}`
  );
}

// --- Manual Reading Endpoints ---

export async function submitManualReading(input: ManualReadingInput) {
  return apiFetch<ManualReading>(`${API_BASE}/manual-reading`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchManualHistory(plantId?: string, limit = 20) {
  const params = new URLSearchParams();
  if (plantId) params.set('plant_id', plantId);
  params.set('limit', String(limit));
  return apiFetch<{ readings: ManualReading[] }>(
    `${API_BASE}/manual-history?${params.toString()}`
  );
}

// --- AI Endpoints ---

export async function requestAnalysis(request: AnalysisRequest) {
  return apiFetch<{ analysis: PlantAnalysis }>(`${API_BASE}/analyze`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function sendChatMessage(request: ChatRequest) {
  return apiFetch<{ reply: string }>(`${API_BASE}/chat`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
