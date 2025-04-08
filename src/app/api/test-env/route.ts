import { NextResponse } from 'next/server';
import { validateEnvironmentVariables } from '@/lib/validate-env';

export async function GET() {
  // Prevent access in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      message: 'This endpoint is not available in production'
    }, { status: 404 });
  }

  try {
    // Run environment validation
    validateEnvironmentVariables();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Environment variables validated successfully',
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Environment validation failed'
    }, { status: 500 });
  }
} 