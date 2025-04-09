-- Migration: create_action_items_table
-- Description: Create action_items table for tracking SEO recommendations

-- Up Migration
BEGIN;

-- Create action_items table for more detailed tracking
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

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS action_items_report_id_idx ON action_items(report_id);
CREATE INDEX IF NOT EXISTS action_items_priority_idx ON action_items(priority);
CREATE INDEX IF NOT EXISTS action_items_status_idx ON action_items(status);

-- RLS Configuration
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can do all operations on action_items"
ON action_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for anonymous users to insert action items
CREATE POLICY "Anonymous users can insert action items"
ON action_items FOR INSERT TO anon
WITH CHECK (true);

-- Create policy for anonymous users to read their own action items
CREATE POLICY "Anonymous users can read their own action items"
ON action_items FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM reports
    JOIN leads ON reports.lead_id = leads.id
    WHERE action_items.report_id = reports.id
    AND leads.email = current_user
  )
);

COMMIT;

-- Down Migration
BEGIN;
DROP TABLE IF EXISTS action_items;
COMMIT; 