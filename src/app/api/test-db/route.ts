import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      message: 'This endpoint is not available in production'
    }, { status: 404 });
  }

  try {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      url: 'https://example.com'
    };

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Testing database connection...');
    }
    
    // Try using the admin client directly
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([{ ...testData, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      // Log full error details server-side
      console.error('Database error:', error);
      
      // Return sanitized error to client
      return NextResponse.json({ 
        success: false, 
        message: 'Database operation failed'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test successful - database connection working'
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while testing the database connection'
    }, { status: 500 });
  }
} 