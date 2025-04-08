import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // This is a workaround for testing only, not for production use

    // For PostgreSQL, you would normally execute this via SQL:
    // ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
    // ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

    // Since we can't execute raw SQL via the JS client directly,
    // we'll use a workaround for testing

    return NextResponse.json({ 
      success: false, 
      message: 'SQL execution needed',
      sql: `
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
      message: 'Error trying to disable RLS',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 