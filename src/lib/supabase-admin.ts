import { createClient } from '@supabase/supabase-js';
import { getEnvVariable } from './validateEnvironment';

// Get Supabase URL (required for all environments)
const supabaseUrl = getEnvVariable('NEXT_PUBLIC_SUPABASE_URL');

// For service role key, allow it to be optional in certain contexts
let supabaseServiceKey = '';
try {
  supabaseServiceKey = getEnvVariable('SUPABASE_SERVICE_ROLE_KEY');
} catch (error) {
  // In development, just warn about missing service key
  if (process.env.NODE_ENV === 'development') {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - admin operations will fail');
  }
}

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

/**
 * Validates if the service role key is available
 * @throws Error if the service role key is not available
 */
export function validateServiceRoleKey(): void {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  if (!supabaseServiceKey.startsWith('eyJhbGc')) {
    throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format');
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
    // Validate service role key before proceeding
    validateServiceRoleKey();
    
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
    // Validate service role key before proceeding
    validateServiceRoleKey();
    
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
