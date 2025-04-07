import { NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/supabase-health';

export async function GET() {
  try {
    const supabaseHealth = await checkSupabaseHealth();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: supabaseHealth,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
} 