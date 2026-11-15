import { useState, useCallback } from 'react';
import type { Plant, GrowthStage } from '../types/plant';
import { PREDEFINED_PLANTS } from '../data/predefinedPlants';

export function usePlantSelection() {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(PREDEFINED_PLANTS[0].id);
  const [growthStage, setGrowthStage] = useState<GrowthStage>('Unknown');

  const selectedPlant: Plant | undefined = PREDEFINED_PLANTS.find(
    (p) => p.id === selectedPlantId
  );

  const selectPlant = useCallback((plantId: string) => {
    setSelectedPlantId(plantId);
    // Reset growth stage when switching plants
    setGrowthStage('Unknown');
  }, []);

  return {
    plants: PREDEFINED_PLANTS,
    selectedPlantId,
    selectedPlant,
    selectPlant,
    growthStage,
    setGrowthStage,
  };
}
