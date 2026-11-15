// Sensor telemetry and manual reading type definitions

export type ConnectionStatus = 'online' | 'stale' | 'offline';
export type MoistureStatus = 'Dry' | 'Damp' | 'Wet';
export type InputSource = 'manual';

export const MOISTURE_CONDITIONS: MoistureStatus[] = ['Dry', 'Damp', 'Wet'];

export interface SensorReading {
  entry_id: number;
  timestamp: string;
  raw_adc: number;
  moisture_pct: number;
  sensor_status: string;
  plant_id: string | null;
  connection_status: ConnectionStatus;
  is_stale: boolean;
  seconds_since_update: number;
  stale_threshold_seconds: number;
}

export interface SensorHistoryPoint {
  entry_id: number;
  timestamp: string;
  raw_adc: number;
  moisture_pct: number;
  source: 'sensor';
}

export interface ManualReading {
  id: string;
  plant_id: string;
  growth_stage: string;
  moisture_status: MoistureStatus;
  input_source: InputSource;
  notes: string | null;
  created_at: string;
}

export interface ManualReadingInput {
  plant_id: string;
  growth_stage: string;
  moisture_status: MoistureStatus;
  notes?: string;
}
