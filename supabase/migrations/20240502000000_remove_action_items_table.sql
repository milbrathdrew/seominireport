-- Migration: remove_action_items_table
-- Description: Remove action_items table and clean up action_items related fields

-- Up Migration
BEGIN;

-- Drop action_items table if it exists
DROP TABLE IF EXISTS action_items;

-- Remove action_items column from reports table
ALTER TABLE reports 
DROP COLUMN IF EXISTS action_items;

COMMIT;

-- Down Migration (if we ever need to revert)
BEGIN;
-- Note: This down migration cannot fully restore the data that was in the action_items table
-- It can only recreate the empty structure
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending',
  effort_level TEXT NOT NULL DEFAULT 'medium',
  expected_impact TEXT NOT NULL DEFAULT 'medium',
  implementation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add action_items column back to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '{}'::jsonb;

COMMIT; 