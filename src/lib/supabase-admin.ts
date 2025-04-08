import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only log in development environment
if (process.env.NODE_ENV === 'development') {
  // Safe logging that doesn't expose key details
  console.log('Supabase Admin Configuration:');
  console.log('- URL configured:', Boolean(supabaseUrl));
  console.log('- Service key configured:', Boolean(supabaseServiceKey));
  console.log('- Service key valid format:', Boolean(
    supabaseServiceKey && 
    supabaseServiceKey.length > 100 && 
    supabaseServiceKey.startsWith('eyJhbGc')
  ));
}

// Validate environment setup
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Missing Supabase admin credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
}

// Throw error in production if service key is missing or invalid
if (process.env.NODE_ENV === 'production') {
  if (!supabaseServiceKey) {
    throw new Error('Service role key is required in production environment');
  }
  if (!supabaseServiceKey.startsWith('eyJhbGc')) {
    throw new Error('Invalid service role key format in production environment');
  }
}

/**
 * Supabase Admin Client
 * 
 * This client uses the service role key which bypasses Row Level Security (RLS).
 * IMPORTANT: Only use this client in server-side code (API routes) - never in client-side code!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Store a new lead in the database using admin privileges
 */
export async function storeLeadAdmin(leadData: {
  name: string;
  email: string;
  url: string;
}): Promise<any | null> {
  try {
    // Only log minimal information in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Storing lead data (admin): email domain', leadData.email.split('@')[1]);
    }
    
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([{ ...leadData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      // Log full error details server-side only
      console.error('Error storing lead (admin):', error);
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Lead stored successfully (admin): ID', data.id);
    }
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
