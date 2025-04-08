import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check environment variables (without revealing actual keys)
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      URL_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Environment check',
      environment: process.env.NODE_ENV,
      envCheck
    });
  } catch (error) {
    console.error('Test env error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing environment',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 