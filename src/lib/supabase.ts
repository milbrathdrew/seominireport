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
  technical_details?: {
    httpsProtocol: boolean;
    domainHasWww: boolean;
    domainStructure: string;
    pathDepth: number;
    hasQueryParams: boolean;
    hasFragment: boolean;
    [key: string]: any;
  };
  action_items?: {
    [category: string]: {
      items: Array<{
        title: string;
        description: string;
        priority: number;
      }>;
    };
  };
  priority_fixes?: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
  }>;
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

export type ActionItem = {
  id?: string;
  report_id: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  effort_level: 'low' | 'medium' | 'high';
  expected_impact: 'low' | 'medium' | 'high';
  implementation_notes?: string;
  created_at?: string;
  completed_at?: string;
};

export type LeadWithReports = Lead & {
  reports: Report[];
};

export type ReportWithActionItems = Report & {
  action_items: ActionItem[];
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
 * Create action items from SEO recommendations
 */
export async function createActionItemsFromRecommendations(
  reportId: string, 
  recommendations: string[]
): Promise<ActionItem[] | null> {
  try {
    // Map recommendations to action items with categories and priorities
    const actionItems = recommendations.map((recommendation, index) => {
      // Determine category based on recommendation content
      let category = 'general';
      if (recommendation.toLowerCase().includes('title tag')) category = 'meta';
      else if (recommendation.toLowerCase().includes('description')) category = 'meta';
      else if (recommendation.toLowerCase().includes('heading')) category = 'content';
      else if (recommendation.toLowerCase().includes('h1') || recommendation.toLowerCase().includes('h2')) category = 'content';
      else if (recommendation.toLowerCase().includes('image')) category = 'media';
      else if (recommendation.toLowerCase().includes('mobile')) category = 'technical';
      else if (recommendation.toLowerCase().includes('load')) category = 'performance';
      else if (recommendation.toLowerCase().includes('link')) category = 'links';
      else if (recommendation.toLowerCase().includes('www')) category = 'technical';
      else if (recommendation.toLowerCase().includes('keyword')) category = 'keywords';
      
      // Determine priority based on recommendation position and content
      // First 3 items are considered higher priority
      let priority = index < 3 ? 1 : index < 6 ? 2 : 3;
      
      // Certain types of recommendations have intrinsic priority
      if (recommendation.toLowerCase().includes('https') || 
          recommendation.toLowerCase().includes('mobile') ||
          recommendation.toLowerCase().includes('title tag')) {
        priority = 1; // High priority
      }
      
      // Create the action item
      return {
        report_id: reportId,
        category,
        title: recommendation.split('.')[0] + '.',  // First sentence as title
        description: recommendation,
        priority,
        status: 'pending',
        effort_level: 'medium',
        expected_impact: priority === 1 ? 'high' : priority === 2 ? 'medium' : 'low',
        created_at: new Date().toISOString()
      };
    });
    
    // Insert all action items
    const { data, error } = await supabase
      .from('action_items')
      .insert(actionItems)
      .select();
      
    if (error) {
      console.error('Error creating action items:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error creating action items:', error);
    return null;
  }
}

/**
 * Get action items for a specific report
 */
export async function getActionItemsByReportId(reportId: string): Promise<ActionItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('report_id', reportId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching action items:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching action items:', error);
    return null;
  }
}

/**
 * Update an action item status
 */
export async function updateActionItemStatus(
  id: string, 
  status: ActionItem['status'], 
  implementation_notes?: string
): Promise<ActionItem | null> {
  try {
    const updates: any = { status };
    
    // If status is completed, set completed_at date
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else {
      // If status is not completed, ensure completed_at is null
      updates.completed_at = null;
    }
    
    // Add implementation notes if provided
    if (implementation_notes) {
      updates.implementation_notes = implementation_notes;
    }
    
    const { data, error } = await supabase
      .from('action_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating action item:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating action item:', error);
    return null;
  }
}

/**
 * Get a report by ID with its action items
 */
export async function getReportWithActionItems(id: string): Promise<ReportWithActionItems | null> {
  try {
    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      console.error('Error fetching report:', reportError);
      return null;
    }

    // Get action items for this report
    const { data: actionItems, error: actionItemsError } = await supabase
      .from('action_items')
      .select('*')
      .eq('report_id', id)
      .order('priority', { ascending: true });

    if (actionItemsError) {
      console.error('Error fetching action items:', actionItemsError);
      return { ...report, action_items: [] };
    }

    return { ...report, action_items: actionItems || [] };
  } catch (error) {
    console.error('Unexpected error fetching report with action items:', error);
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