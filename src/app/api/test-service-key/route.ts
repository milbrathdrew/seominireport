import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Test if the key is properly formatted and validates with Supabase
async function testServiceKey(serviceKey: string): Promise<{
  isValid: boolean;
  message: string;
  debug?: any;
}> {
  try {
    // Do not log the actual key, just its properties
    const cleanedKey = serviceKey.substring(0, 12) + '...' + serviceKey.substring(serviceKey.length - 4);
    console.log('Testing service key:', cleanedKey);
    console.log('Key length:', serviceKey.length);
    console.log('Key format check:', Boolean(serviceKey.includes('eyJhbGciOiJIUzI1')));

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    console.log('Supabase URL:', url);
    
    // Try to create a temporary client with the service key
    const tempClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test a simple query
    const { data, error, count } = await tempClient.from('leads').select('count', { count: 'exact', head: true });
    
    console.log('Query result:', { data, error, count });
    
    if (error) {
      console.error('Service key validation error:', error);
      return {
        isValid: false,
        message: `Service key validation failed: ${error.message}`,
        debug: { error }
      };
    }
    
    return {
      isValid: true,
      message: 'Service key is valid',
      debug: { count }
    };
  } catch (error) {
    console.error('Service key validation error:', error);
    return {
      isValid: false,
      message: `Error validating service key: ${error instanceof Error ? error.message : String(error)}`,
      debug: { error }
    };
  }
}

export async function GET(request: Request) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!serviceKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'Service key is not defined in environment variables'
      }, { status: 500 });
    }
    
    const validation = await testServiceKey(serviceKey);
    
    return NextResponse.json({ 
      success: validation.isValid, 
      message: validation.message,
      environment: process.env.NODE_ENV,
      debug: validation.debug
    });
  } catch (error) {
    console.error('Test service key error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing service key',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 