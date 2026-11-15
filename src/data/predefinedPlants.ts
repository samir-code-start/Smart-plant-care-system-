// Predefined plant data — used for instant rendering before DB loads.
// This is the canonical source for plant metadata.
// The same data is seeded into Supabase via database/seed.sql.

import type { Plant } from '../types/plant';

export const PREDEFINED_PLANTS: Plant[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    botanical_name: 'Solanum lycopersicum',
    description:
      'A warm-season fruiting plant prized for its versatile edible berries. Thrives in full sun with consistent moisture, especially during flowering and fruit development.',
    moisture_min_pct: 60,
    moisture_max_pct: 80,
    watering_requirements:
      'Water deeply and consistently. Keep soil evenly moist but not waterlogged. Increase frequency during flowering and fruiting. Water at the base to avoid wetting foliage.',
    care_instructions:
      'Provide 6-8 hours of direct sunlight daily. Support with stakes or cages. Mulch around the base to retain moisture and regulate soil temperature. Prune suckers for indeterminate varieties. Watch for blossom end rot (calcium/water imbalance).',
    created_at: '',
  },
  {
    id: 'basil',
    name: 'Basil',
    botanical_name: 'Ocimum basilicum',
    description:
      'An aromatic culinary herb from the mint family. Prefers warm conditions with moist, well-drained soil and plenty of sunlight.',
    moisture_min_pct: 50,
    moisture_max_pct: 70,
    watering_requirements:
      'Water when the top inch of soil feels dry. Keep soil consistently moist but never soggy. Reduce watering in cooler weather. Avoid overhead watering to prevent fungal issues.',
    care_instructions:
      'Provide 6-8 hours of sunlight. Pinch off flower buds to encourage bushier leaf growth and prolong harvest. Harvest leaves from the top down. Sensitive to cold — protect from temperatures below 10°C (50°F).',
    created_at: '',
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    botanical_name: 'Aloe barbadensis miller',
    description:
      'A drought-tolerant succulent known for its medicinal gel-filled leaves. Stores water internally and prefers infrequent deep watering with excellent drainage.',
    moisture_min_pct: 15,
    moisture_max_pct: 30,
    watering_requirements:
      'Water deeply but infrequently using the soak-and-dry method. Allow soil to dry completely between waterings. Water every 2-3 weeks in summer, monthly in winter. Never let the pot sit in standing water.',
    care_instructions:
      'Provide bright indirect light or partial direct sun. Use well-draining cactus/succulent potting mix. Terracotta pots help wick excess moisture. Avoid cold drafts and freezing temperatures. Overwatering is the most common cause of death.',
    created_at: '',
  },
  {
    id: 'money-plant',
    name: 'Money Plant',
    botanical_name: 'Epipremnum aureum',
    description:
      "A hardy trailing vine (also known as Pothos or Devil's Ivy) popular as an indoor houseplant. Tolerates low light and irregular watering, making it ideal for beginners.",
    moisture_min_pct: 40,
    moisture_max_pct: 60,
    watering_requirements:
      'Allow the top 25-30% of the potting mix to dry out between waterings. Water thoroughly when dry, then let excess drain. Reduce frequency in winter. Tolerates occasional neglect.',
    care_instructions:
      'Thrives in indirect light but tolerates low-light conditions. Avoid direct sunlight which can scorch leaves. Trim leggy vines to encourage fuller growth. Can be grown in water or soil. Wipe leaves occasionally to remove dust.',
    created_at: '',
  },
  {
    id: 'mint',
    name: 'Mint',
    botanical_name: 'Mentha spicata',
    description:
      'A vigorous, fast-spreading aromatic herb. Loves consistently moist soil and can become invasive if not contained. Ideal for containers.',
    moisture_min_pct: 60,
    moisture_max_pct: 80,
    watering_requirements:
      'Keep soil consistently moist at all times. Mint is a thirsty plant — water frequently, especially in warm weather. Do not let the soil dry out completely. Good drainage prevents root rot despite high moisture needs.',
    care_instructions:
      'Grows well in partial shade to full sun (partial shade in hot climates). Contain in pots to prevent aggressive spreading. Harvest frequently to promote bushy growth. Cut back in autumn. Very cold-hardy and returns each spring.',
    created_at: '',
  },
  {
    id: 'rose',
    name: 'Rose',
    botanical_name: 'Rosa spp.',
    description:
      'A classic ornamental flowering shrub available in thousands of cultivars. Requires consistent care, good air circulation, and deep watering for healthy blooms.',
    moisture_min_pct: 50,
    moisture_max_pct: 70,
    watering_requirements:
      'Water deeply at the base of the plant, soaking the root zone. Avoid wetting leaves and flowers to prevent fungal diseases. Water 2-3 times per week in summer, less in cooler months. Mulch to retain moisture.',
    care_instructions:
      'Provide at least 6 hours of direct sunlight daily. Prune in late winter or early spring to encourage new growth. Deadhead spent blooms to promote continuous flowering. Feed with balanced rose fertiliser during the growing season. Watch for aphids, black spot, and powdery mildew.',
    created_at: '',
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    botanical_name: 'Cucumis sativus',
    description:
      'A warm-season vine crop producing crisp, refreshing fruit. Requires high moisture, warm soil, and plenty of sunlight for optimal yield.',
    moisture_min_pct: 60,
    moisture_max_pct: 80,
    watering_requirements:
      'Water deeply and consistently — cucumbers are over 95% water and demand steady hydration. Keep soil evenly moist, especially during flowering and fruiting. Inconsistent watering causes bitter or misshapen fruit. Mulch heavily to retain moisture.',
    care_instructions:
      'Provide full sun (6-8 hours). Use trellising for vertical growth to save space and improve air circulation. Harvest regularly to encourage continued production. Sensitive to cold — plant after last frost. Watch for cucumber beetles and powdery mildew.',
    created_at: '',
  },
];
