import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      message: 'This endpoint is not available in production'
    }, { status: 404 });
  }

  try {
    // This is a workaround for testing only, not for production use

    // For PostgreSQL, you would normally execute this via SQL:
    // ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
    // ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

    // Since we can't execute raw SQL via the JS client directly,
    // provide instructions for manual setup

    return NextResponse.json({ 
      success: false, 
      message: 'SQL execution needed for development purposes only',
      sql: `
-- WARNING: Only run in development environment
-- Run these SQL commands in the Supabase SQL editor:

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- To re-enable later:
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
      `
    });
  } catch (error) {
    console.error('Disable RLS error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error generating SQL instructions'
    }, { status: 500 });
  }
} 