import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Test if the key is properly formatted and validates with Supabase
async function testServiceKey(serviceKey: string): Promise<{
  isValid: boolean;
  message: string;
}> {
  try {
    // Safety check for key format
    const isValidFormat = Boolean(
      serviceKey && 
      serviceKey.length > 100 && 
      serviceKey.startsWith('eyJhbGc')
    );
    
    if (!isValidFormat) {
      return {
        isValid: false,
        message: 'Service key has invalid format'
      };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // Try to create a temporary client with the service key
    const tempClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test a simple query
    const { error } = await tempClient.from('leads').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Service key validation error:', error);
      return {
        isValid: false,
        message: `Service key validation failed: ${error.message}`
      };
    }
    
    return {
      isValid: true,
      message: 'Service key is valid'
    };
  } catch (error) {
    console.error('Service key validation error:', error);
    return {
      isValid: false,
      message: `Error validating service key: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function GET(request: Request) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      message: 'This endpoint is not available in production'
    }, { status: 404 });
  }

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
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Test service key error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing service key'
    }, { status: 500 });
  }
} 