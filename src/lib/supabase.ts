import { createClient } from '@supabase/supabase-js';
import { getEnvVariable } from './validateEnvironment';

// Initialize Supabase client
const supabaseUrl = getEnvVariable('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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
  technical_details?: {
    httpsProtocol: boolean;
    domainHasWww: boolean;
    domainStructure: string;
    pathDepth: number;
    hasQueryParams: boolean;
    hasFragment: boolean;
    [key: string]: any;
  };
  comparison_data?: {
    industry_average?: {
      seo: number;
      performance: number;
      accessibility: number;
      bestPractices: number;
    };
    competitors?: Array<{
      url: string;
      scores: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
      };
    }>;
  };
  created_at?: string;
};

export type LeadWithReports = Lead & {
  reports: Report[];
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
    // Validate required fields
    if (!reportData.lead_id) {
      console.error('Error storing report: lead_id is required');
      return null;
    }
    
    if (!reportData.url) {
      console.error('Error storing report: url is required');
      return null;
    }
    
    console.log(`Storing report for URL: ${reportData.url}, Lead ID: ${reportData.lead_id}`);
    
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...reportData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error storing report:', JSON.stringify(error, null, 2));
      console.error('Error details:', error.details, error.hint, error.code);
      return null;
    }

    console.log('Report stored successfully with ID:', data.id);
    return data;
  } catch (error) {
    console.error('Unexpected error storing report:', 
      error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Create action items from SEO recommendations
 * Note: This function is intentionally disabled
 */
export async function createActionItemsFromRecommendations(
  reportId: string, 
  recommendations: string[]
): Promise<null> {
  // Return null - action items functionality is disabled
  return null;
}

/**
 * Get a report by ID with action items
 * Note: Action items functionality has been removed, returns just the report
 */
export async function getReportWithActionItems(id: string): Promise<Report | null> {
  try {
    return await getReportById(id);
  } catch (error) {
    console.error('Unexpected error fetching report:', error);
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

/**
 * Get all leads with their associated reports
 */
export async function getAllLeadsWithReports(): Promise<LeadWithReports[] | null> {
  try {
    // First get all leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      return null;
    }

    // Now get reports for each lead
    const leadsWithReports: LeadWithReports[] = [];
    
    for (const lead of leads) {
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
        
      if (reportsError) {
        console.error(`Error fetching reports for lead ${lead.id}:`, reportsError);
        // Continue with other leads even if one fails
        leadsWithReports.push({ ...lead, reports: [] });
      } else {
        leadsWithReports.push({ ...lead, reports: reports || [] });
      }
    }
    
    return leadsWithReports;
  } catch (error) {
    console.error('Unexpected error fetching all leads with reports:', error);
    return null;
  }
}

/**
 * Get a specific lead with all associated reports
 */
export async function getLeadWithReports(leadId: string): Promise<LeadWithReports | null> {
  try {
    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Error fetching lead:', leadError);
      return null;
    }

    // Get reports for this lead
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports for lead:', reportsError);
      return { ...lead, reports: [] };
    }

    return { ...lead, reports: reports || [] };
  } catch (error) {
    console.error('Unexpected error fetching lead with reports:', error);
    return null;
  }
} 