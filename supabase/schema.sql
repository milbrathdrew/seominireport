-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, url)
);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  scores JSONB NOT NULL,
  recommendations TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster querying
CREATE INDEX leads_email_idx ON leads(email);
CREATE INDEX reports_lead_id_idx ON reports(lead_id);

-- Row Level Security policies
-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for the service role (allows all operations)
CREATE POLICY "Service role can do all operations on leads"
ON leads FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do all operations on reports"
ON reports FOR ALL TO authenticated
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