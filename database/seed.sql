-- ============================================
-- Smart Plant Care System — Seed Data
-- ============================================
-- Run this AFTER schema.sql to populate the 7 predefined plants.
-- ============================================

INSERT INTO public.plants (id, name, botanical_name, description, moisture_min_pct, moisture_max_pct, watering_requirements, care_instructions)
VALUES
(
    'tomato',
    'Tomato',
    'Solanum lycopersicum',
    'A warm-season fruiting plant prized for its versatile edible berries. Thrives in full sun with consistent moisture, especially during flowering and fruit development.',
    60,
    80,
    'Water deeply and consistently. Keep soil evenly moist but not waterlogged. Increase frequency during flowering and fruiting. Water at the base to avoid wetting foliage.',
    'Provide 6-8 hours of direct sunlight daily. Support with stakes or cages. Mulch around the base to retain moisture and regulate soil temperature. Prune suckers for indeterminate varieties. Watch for blossom end rot (calcium/water imbalance).'
),
(
    'basil',
    'Basil',
    'Ocimum basilicum',
    'An aromatic culinary herb from the mint family. Prefers warm conditions with moist, well-drained soil and plenty of sunlight.',
    50,
    70,
    'Water when the top inch of soil feels dry. Keep soil consistently moist but never soggy. Reduce watering in cooler weather. Avoid overhead watering to prevent fungal issues.',
    'Provide 6-8 hours of sunlight. Pinch off flower buds to encourage bushier leaf growth and prolong harvest. Harvest leaves from the top down. Sensitive to cold — protect from temperatures below 10°C (50°F).'
),
(
    'aloe-vera',
    'Aloe Vera',
    'Aloe barbadensis miller',
    'A drought-tolerant succulent known for its medicinal gel-filled leaves. Stores water internally and prefers infrequent deep watering with excellent drainage.',
    15,
    30,
    'Water deeply but infrequently using the soak-and-dry method. Allow soil to dry completely between waterings. Water every 2-3 weeks in summer, monthly in winter. Never let the pot sit in standing water.',
    'Provide bright indirect light or partial direct sun. Use well-draining cactus/succulent potting mix. Terracotta pots help wick excess moisture. Avoid cold drafts and freezing temperatures. Overwatering is the most common cause of death.'
),
(
    'money-plant',
    'Money Plant',
    'Epipremnum aureum',
    'A hardy trailing vine (also known as Pothos or Devil''s Ivy) popular as an indoor houseplant. Tolerates low light and irregular watering, making it ideal for beginners.',
    40,
    60,
    'Allow the top 25-30% of the potting mix to dry out between waterings. Water thoroughly when dry, then let excess drain. Reduce frequency in winter. Tolerates occasional neglect.',
    'Thrives in indirect light but tolerates low-light conditions. Avoid direct sunlight which can scorch leaves. Trim leggy vines to encourage fuller growth. Can be grown in water or soil. Wipe leaves occasionally to remove dust.'
),
(
    'mint',
    'Mint',
    'Mentha spicata',
    'A vigorous, fast-spreading aromatic herb. Loves consistently moist soil and can become invasive if not contained. Ideal for containers.',
    60,
    80,
    'Keep soil consistently moist at all times. Mint is a thirsty plant — water frequently, especially in warm weather. Do not let the soil dry out completely. Good drainage prevents root rot despite high moisture needs.',
    'Grows well in partial shade to full sun (partial shade in hot climates). Contain in pots to prevent aggressive spreading. Harvest frequently to promote bushy growth. Cut back in autumn. Very cold-hardy and returns each spring.'
),
(
    'rose',
    'Rose',
    'Rosa spp.',
    'A classic ornamental flowering shrub available in thousands of cultivars. Requires consistent care, good air circulation, and deep watering for healthy blooms.',
    50,
    70,
    'Water deeply at the base of the plant, soaking the root zone. Avoid wetting leaves and flowers to prevent fungal diseases. Water 2-3 times per week in summer, less in cooler months. Mulch to retain moisture.',
    'Provide at least 6 hours of direct sunlight daily. Prune in late winter or early spring to encourage new growth. Deadhead spent blooms to promote continuous flowering. Feed with balanced rose fertiliser during the growing season. Watch for aphids, black spot, and powdery mildew.'
),
(
    'cucumber',
    'Cucumber',
    'Cucumis sativus',
    'A warm-season vine crop producing crisp, refreshing fruit. Requires high moisture, warm soil, and plenty of sunlight for optimal yield.',
    60,
    80,
    'Water deeply and consistently — cucumbers are over 95% water and demand steady hydration. Keep soil evenly moist, especially during flowering and fruiting. Inconsistent watering causes bitter or misshapen fruit. Mulch heavily to retain moisture.',
    'Provide full sun (6-8 hours). Use trellising for vertical growth to save space and improve air circulation. Harvest regularly to encourage continued production. Sensitive to cold — plant after last frost. Watch for cucumber beetles and powdery mildew.'
)
ON CONFLICT (id) DO NOTHING;
