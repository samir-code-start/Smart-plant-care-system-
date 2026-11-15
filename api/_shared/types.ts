// Shared TypeScript types for API request/response contracts

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  connection_status?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ThingSpeak feed entry from their REST API
export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // raw_adc
  field2: string | null; // moisture_pct
  field3: string | null; // plant_id
  field4: string | null; // sensor_status
}

export interface ThingSpeakChannelResponse {
  channel: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: ThingSpeakFeed[];
}

// Validated plant IDs
export const VALID_PLANT_IDS = [
  'tomato',
  'basil',
  'aloe-vera',
  'money-plant',
  'mint',
  'rose',
  'cucumber',
] as const;

export const VALID_GROWTH_STAGES = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Mature',
  'Unknown',
] as const;

export const VALID_MOISTURE_STATUSES = ['Dry', 'Damp', 'Wet'] as const;
