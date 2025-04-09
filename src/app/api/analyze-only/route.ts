import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { analyzeSeo, isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';
import { validateEnvironmentVariables } from '@/lib/validate-env';

export async function POST(request: Request) {
  try {
    // First validate environment variables
    validateEnvironmentVariables();
    
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required' 
      }, { status: 400 });
    }
    
    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid URL format' 
      }, { status: 400 });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Generating SEO analysis for: ${url}`);
    }
    
    try {
      const normalizedUrl = normalizeUrl(url);
      const seoAnalysisResult = analyzeSeo(normalizedUrl);
      
      // Format the report data consistently with other routes
      const reportData: ReportData = {
        url: normalizedUrl,
        date: new Date().toISOString(),
        scores: {
          seo: seoAnalysisResult.scores.metaScore,
          performance: seoAnalysisResult.scores.technicalScore,
          accessibility: 70, // Default score as we can't measure accessibility from URL alone
          bestPractices: seoAnalysisResult.scores.contentScore
        },
        recommendations: seoAnalysisResult.recommendations,
        // Additional data from the analysis
        analysisDetails: {
          technical: seoAnalysisResult.technicalAnalysis,
          overallScore: seoAnalysisResult.scores.overallScore
        }
      };
      
      return NextResponse.json({ 
        success: true,
        report: reportData
      });
    } catch (analysisError) {
      console.error(`Error analyzing URL ${url}:`, analysisError);
      
      // Provide a fallback report with basic information
      const fallbackReport: ReportData = {
        url,
        date: new Date().toISOString(),
        scores: {
          performance: 50,
          accessibility: 50,
          seo: 50,
          bestPractices: 50
        },
        recommendations: [
          "We couldn't fully analyze your website. Please ensure it's publicly accessible.",
          "Check that your URL is correct and the site is online.",
          "Make sure your website allows robots to crawl it."
        ]
      };
      
      return NextResponse.json({ 
        success: true,
        message: 'Basic report generated with limited analysis',
        report: fallbackReport
      });
    }
  } catch (error) {
    console.error('Error in analyze-only endpoint:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to analyze URL'
    }, { status: 500 });
  }
} 