-- Migration: add_priority_fixes_field_to_reports
-- Description: Add priority_fixes column to reports table

-- Up Migration
BEGIN;

-- Add priority_fixes column to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS priority_fixes JSONB[] DEFAULT ARRAY[]::jsonb[];

-- Also add other columns that might be missing compared to setup-db.js
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS technical_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '{}'::jsonb;

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS comparison_data JSONB DEFAULT '{}'::jsonb;

COMMIT;

-- Down Migration
BEGIN;
ALTER TABLE reports DROP COLUMN IF EXISTS priority_fixes;
COMMIT;
