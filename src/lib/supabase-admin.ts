import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Missing Supabase admin credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
}

/**
 * Supabase Admin Client
 * 
 * This client uses the service role key which bypasses Row Level Security (RLS).
 * IMPORTANT: Only use this client in server-side code (API routes) - never in client-side code!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Store a new lead in the database using admin privileges
 */
export async function storeLeadAdmin(leadData: {
  name: string;
  email: string;
  url: string;
}): Promise<any | null> {
  try {
    console.log('Storing lead data (admin):', leadData);
    
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([{ ...leadData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error storing lead (admin):', error);
      console.error('Error details:', error.details, error.hint, error.code);
      return null;
    }

    console.log('Lead stored successfully (admin):', data);
    return data;
  } catch (error) {
    console.error('Unexpected error storing lead (admin):', error);
    return null;
  }
}

/**
 * Store a new report in the database using admin privileges
 */
export async function storeReportAdmin(reportData: {
  lead_id: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  recommendations: string[];
}): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert([{ ...reportData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error storing report (admin):', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error storing report (admin):', error);
    return null;
  }
}
