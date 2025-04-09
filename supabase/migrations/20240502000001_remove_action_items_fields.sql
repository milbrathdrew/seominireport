-- Migration: remove_action_items_fields
-- Description: Remove all remaining action items related fields from database tables

-- Up Migration
BEGIN;

-- Remove action items related fields from reports table
ALTER TABLE reports 
DROP COLUMN IF EXISTS action_items,
DROP COLUMN IF EXISTS actionable_items,
DROP COLUMN IF EXISTS priority_fixes;

-- Clean up any other tables that might reference action items
-- If there are any foreign key constraints, they'll be dropped automatically when the action_items table is dropped

COMMIT;

-- Down Migration
BEGIN;
-- Restore action items related columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS priority_fixes JSONB[] DEFAULT ARRAY[]::jsonb[];

COMMIT; 