import { supabase } from './supabase';

/**
 * Check if Supabase is properly configured and available
 */
export async function checkSupabaseHealth(): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
}> {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Supabase environment variables are not configured'
    };
  }

  try {
    // Try to connect to Supabase
    const { data, error } = await supabase.from('leads').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "No relations found" which might happen if table doesn't exist yet
      return {
        isConfigured: true,
        isConnected: false,
        message: `Connection failed: ${error.message}`
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      message: 'Supabase connection successful'
    };
  } catch (error) {
    return {
      isConfigured: true,
      isConnected: false,
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 