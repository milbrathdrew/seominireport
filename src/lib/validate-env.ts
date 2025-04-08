/**
 * Environment variable validation for improved security
 */

/**
 * Validates environment variables and logs warnings or errors
 * In production, throws errors for critical configuration issues
 */
export function validateEnvironmentVariables(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';
  
  // Basic presence validation
  if (!supabaseUrl) {
    logOrThrow('Missing Supabase URL', isProd);
  }
  
  if (!supabaseAnonKey) {
    logOrThrow('Missing Supabase anonymous key', isProd);
  }
  
  if (!supabaseServiceKey) {
    logOrThrow('Missing Supabase service role key', isProd);
  }
  
  // Format validation
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    logOrThrow('Invalid Supabase URL format', isProd);
  }
  
  // Key format validation
  if (supabaseAnonKey && (!supabaseAnonKey.startsWith('eyJhbGc') || supabaseAnonKey.length < 100)) {
    logOrThrow('Invalid Supabase anonymous key format', isProd);
  }
  
  if (supabaseServiceKey && (!supabaseServiceKey.startsWith('eyJhbGc') || supabaseServiceKey.length < 100)) {
    logOrThrow('Invalid Supabase service role key format', isProd);
  }
  
  // Development-only feedback
  if (isDev && supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
    console.log('✓ Environment validation passed');
  }
}

/**
 * Helper to either log a warning or throw an error depending on environment
 */
function logOrThrow(message: string, shouldThrow: boolean): void {
  if (shouldThrow) {
    throw new Error(`Environment Error: ${message}`);
  } else {
    console.warn(`Environment Warning: ${message}`);
  }
}
