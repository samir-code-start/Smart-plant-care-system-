// Plant and Growth Stage type definitions

export type GrowthStage =
  | 'Seedling'
  | 'Vegetative'
  | 'Flowering'
  | 'Fruiting'
  | 'Mature'
  | 'Unknown';

export const GROWTH_STAGES: GrowthStage[] = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Mature',
  'Unknown',
];

export interface Plant {
  id: string;
  name: string;
  botanical_name: string | null;
  description: string;
  moisture_min_pct: number;
  moisture_max_pct: number;
  watering_requirements: string;
  care_instructions: string;
  created_at: string;
}
