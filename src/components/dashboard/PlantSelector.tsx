import { ChevronDown } from 'lucide-react';
import type { Plant, GrowthStage } from '../../types/plant';
import { GROWTH_STAGES } from '../../types/plant';

interface PlantSelectorProps {
  plants: Plant[];
  selectedPlantId: string;
  onSelectPlant: (id: string) => void;
  growthStage: GrowthStage;
  onSelectStage: (stage: GrowthStage) => void;
}

export function PlantSelector({
  plants,
  selectedPlantId,
  onSelectPlant,
  growthStage,
  onSelectStage,
}: PlantSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Plant Dropdown */}
      <div>
        <label htmlFor="plant-select" className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Plant
        </label>
        <div className="relative">
          <select
            id="plant-select"
            value={selectedPlantId}
            onChange={(e) => onSelectPlant(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name} {plant.botanical_name ? `(${plant.botanical_name})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Growth Stage Pills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Growth Stage</label>
        <div className="flex flex-wrap gap-2">
          {GROWTH_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => onSelectStage(stage)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                growthStage === stage
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-700'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
