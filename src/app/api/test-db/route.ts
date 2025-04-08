import { NextResponse } from 'next/server';
import { storeLeadAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      url: 'https://example.com'
    };

    // Try to insert a test lead using the admin client
    const lead = await storeLeadAdmin(testData);

    if (!lead) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to store test lead',
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test lead stored successfully',
      data: lead
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing database connection',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 