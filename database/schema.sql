-- ============================================
-- Smart Plant Care System — Database Schema
-- ============================================
-- Run this in Supabase SQL Editor to create all tables,
-- enums, indices, and Row Level Security policies.
-- ============================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Enums
DO $$ BEGIN
    CREATE TYPE growth_stage_enum AS ENUM (
        'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature', 'Unknown'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE moisture_status_enum AS ENUM (
        'Dry', 'Damp', 'Wet'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE input_source_enum AS ENUM (
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Plants Table (Predefined catalog — read-only for clients)
CREATE TABLE IF NOT EXISTS public.plants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    botanical_name TEXT,
    description TEXT NOT NULL,
    moisture_min_pct INTEGER NOT NULL CHECK (moisture_min_pct >= 0 AND moisture_min_pct <= 100),
    moisture_max_pct INTEGER NOT NULL CHECK (moisture_max_pct >= moisture_min_pct AND moisture_max_pct <= 100),
    watering_requirements TEXT NOT NULL,
    care_instructions TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Moisture Readings Table (Manual observations only)
CREATE TABLE IF NOT EXISTS public.moisture_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id TEXT NOT NULL REFERENCES public.plants(id) ON DELETE RESTRICT,
    growth_stage growth_stage_enum DEFAULT 'Unknown'::growth_stage_enum NOT NULL,
    moisture_status moisture_status_enum NOT NULL,
    input_source input_source_enum DEFAULT 'manual'::input_source_enum NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Performance Indices
CREATE INDEX IF NOT EXISTS idx_moisture_readings_plant_created
ON public.moisture_readings(plant_id, created_at DESC);

-- 6. Row Level Security
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moisture_readings ENABLE ROW LEVEL SECURITY;

-- Plants: read-only for everyone
CREATE POLICY "Allow public read access to plants"
ON public.plants FOR SELECT
TO anon, authenticated
USING (true);

-- Moisture Readings: read + insert for anon/authenticated
CREATE POLICY "Allow public read of moisture readings"
ON public.moisture_readings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert of manual moisture readings"
ON public.moisture_readings FOR INSERT
TO anon, authenticated
WITH CHECK (
    input_source = 'manual'
    AND moisture_status IN ('Dry', 'Damp', 'Wet')
);
