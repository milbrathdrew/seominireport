/**
 * Environment variable validation
 * This file provides functions to validate required environment variables
 */

/**
 * Validates required environment variables
 * @throws Error if any required environment variables are missing
 */
export function validateEnvironmentVariables(): void {
  const requiredVariables = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}\n` +
      `Please add these variables to your .env.local file for local development or to your Vercel project settings for deployment.`
    );
  }
}

/**
 * Helper to get an environment variable with validation
 * @param key - The environment variable key
 * @param defaultValue - Optional default value
 * @returns The environment variable value or default
 * @throws Error if the variable is not set and no default is provided
 */
export function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value;
} 