import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// Define Supabase database types
export type Lead = {
  id?: string;
  name: string;
  email: string;
  url: string;
  created_at?: string;
};

export type Report = {
  id?: string;
  lead_id: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  recommendations: string[];
  created_at?: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Store a new lead in the database
 */
export async function storeLead(leadData: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
  try {
    console.log('Storing lead data:', leadData);
    
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...leadData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error storing lead:', error);
      console.error('Error details:', error.details, error.hint, error.code);
      return null;
    }

    console.log('Lead stored successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error storing lead:', error);
    return null;
  }
}

/**
 * Store a new report in the database
 */
export async function storeReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...reportData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error storing report:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error storing report:', error);
    return null;
  }
}

/**
 * Get a report by ID
 */
export async function getReportById(id: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching report:', error);
    return null;
  }
}

/**
 * Get reports for a specific lead (by email)
 */
export async function getReportsByEmail(email: string): Promise<Report[] | null> {
  try {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (leadError || !lead) {
      console.error('Error fetching lead by email:', leadError);
      return null;
    }

    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports for lead:', reportsError);
      return null;
    }

    return reports;
  } catch (error) {
    console.error('Unexpected error fetching reports by email:', error);
    return null;
  }
} 