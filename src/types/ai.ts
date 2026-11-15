// AI analysis and chat type definitions

export interface AnalysisRequest {
  plant_id: string;
  growth_stage: string;
  active_telemetry: {
    source: 'sensor' | 'manual';
    moisture_pct?: number;
    moisture_status?: string;
    raw_adc?: number;
    timestamp: string;
    is_stale?: boolean;
  } | null;
  recent_history_summary: Array<{
    timestamp: string;
    source: 'sensor' | 'manual';
    moisture_pct?: number;
    moisture_status?: string;
  }>;
}

export interface PlantAnalysis {
  plant_name: string;
  growth_stage: string;
  evaluation_timestamp: string;
  data_source_evaluated: string;
  moisture_status_assessment: string;
  current_condition_summary: string;
  trend_interpretation: string;
  care_recommendations: string[];
  warnings: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatRequest {
  plant_id: string;
  growth_stage: string;
  message: string;
  conversation_history: ChatMessage[];
}
