import { NextResponse } from 'next/server';
import { analyzeSeo, isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url } = data;

    // Validate input
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    try {
      const normalizedUrl = normalizeUrl(url);
      const seoAnalysisResult = analyzeSeo(normalizedUrl);
      
      return NextResponse.json({ 
        success: true, 
        message: 'SEO analysis completed successfully',
        analysis: seoAnalysisResult
      });
    } catch (analysisError) {
      console.error('SEO analysis error:', analysisError);
      
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to analyze URL',
        error: `Analysis error: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 