-- CONSOLIDATED SCRIPT TO REMOVE ACTION ITEMS FROM DATABASE
-- Run this in the Supabase SQL Editor

-- Start transaction
BEGIN;

-- 1. Drop the action_items table if it exists
DROP TABLE IF EXISTS action_items;

-- 2. Remove all action items related columns from the reports table
ALTER TABLE reports 
DROP COLUMN IF EXISTS action_items,
DROP COLUMN IF EXISTS actionable_items,
DROP COLUMN IF EXISTS priority_fixes;

-- 3. Clean up any RLS policies related to action_items
DROP POLICY IF EXISTS "Service role can do all operations on action_items" ON action_items;
DROP POLICY IF EXISTS "Anonymous users can insert action items" ON action_items;
DROP POLICY IF EXISTS "Anonymous users can read their own action items" ON action_items;

-- 4. Clean up any indexes related to action_items
DROP INDEX IF EXISTS action_items_report_id_idx;
DROP INDEX IF EXISTS action_items_priority_idx;
DROP INDEX IF EXISTS action_items_status_idx;

-- Commit the transaction
COMMIT;

-- Verify changes
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY column_name; 