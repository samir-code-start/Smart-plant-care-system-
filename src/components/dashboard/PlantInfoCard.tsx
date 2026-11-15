import { Droplets, Sun, BookOpen } from 'lucide-react';
import { Card } from '../common/Card';
import type { Plant } from '../../types/plant';

interface PlantInfoCardProps {
  plant: Plant;
}

export function PlantInfoCard({ plant }: PlantInfoCardProps) {
  return (
    <Card title={`${plant.name} — Care Profile`}>
      <p className="text-sm text-gray-600 mb-4">{plant.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Moisture Target */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <Droplets className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Target Moisture
            </p>
            <p className="text-lg font-bold text-blue-900">
              {plant.moisture_min_pct}% – {plant.moisture_max_pct}%
            </p>
          </div>
        </div>

        {/* Watering */}
        <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
          <Sun className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Watering
            </p>
            <p className="text-sm text-emerald-900 leading-snug">
              {plant.watering_requirements}
            </p>
          </div>
        </div>

        {/* Care */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
          <BookOpen className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Care Tips
            </p>
            <p className="text-sm text-amber-900 leading-snug">
              {plant.care_instructions}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
