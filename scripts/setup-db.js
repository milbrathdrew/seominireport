// ONE-TIME SETUP SCRIPT - Do not commit this file to your repository
// This script displays the SQL needed to set up the Supabase database tables
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://amwambnwlbhzcvnoxtyj.supabase.co';
const projectId = 'amwambnwlbhzcvnoxtyj';

// The SQL to execute
const sql = `
-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, url)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  scores JSONB NOT NULL,
  recommendations TEXT[] NOT NULL,
  technical_details JSONB DEFAULT '{}'::jsonb,
  action_items JSONB DEFAULT '{}'::jsonb,
  priority_fixes JSONB[] DEFAULT ARRAY[]::jsonb[],
  comparison_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS reports_lead_id_idx ON reports(lead_id);
CREATE INDEX IF NOT EXISTS action_items_report_id_idx ON action_items(report_id);
CREATE INDEX IF NOT EXISTS action_items_priority_idx ON action_items(priority);
CREATE INDEX IF NOT EXISTS action_items_status_idx ON action_items(status);

-- Row Level Security policies
-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create policies for the service role (allows all operations)
CREATE POLICY "Service role can do all operations on leads"
ON leads FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do all operations on reports"
ON reports FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do all operations on action_items"
ON action_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for anonymous users (insert only)
CREATE POLICY "Anonymous users can insert leads"
ON leads FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Anonymous users can insert reports"
ON reports FOR INSERT TO anon
WITH CHECK (true);

-- Anonymous users can read their own reports by email
CREATE POLICY "Anonymous users can read their own reports"
ON reports FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = reports.lead_id
    AND leads.email = current_user
  )
);

-- Anonymous users can read action items related to their own reports
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
`;

console.log('================================================================');
console.log('SUPABASE DATABASE SETUP SCRIPT');
console.log('================================================================');
console.log('Supabase URL:', supabaseUrl);
console.log('\nPlease follow these manual steps:');
console.log('\n1. Go to your Supabase project dashboard:');
console.log(`   https://app.supabase.com/project/${projectId}/sql`);
console.log('\n2. Create a new SQL query');
console.log('\n3. Copy and paste this SQL script:');
console.log('----------------------------------------------------------------');
console.log(sql);
console.log('----------------------------------------------------------------');
console.log('\n4. Run the SQL script');
console.log('\n5. After running the script, verify the tables were created by');
console.log('   going to the "Table Editor" section of your Supabase dashboard');
console.log('\nOnce the database is set up, your app should be able to connect to it.');
console.log('================================================================');

// Add this script to .gitignore to prevent committing
console.log('\nIMPORTANT: Add this script to .gitignore to avoid committing service role keys!');
console.log('Run: echo "scripts/setup-db.js" >> .gitignore');
console.log('\nRemember to delete this file after setup is complete!'); 