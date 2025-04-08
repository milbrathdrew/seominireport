import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { analyzeSeo, isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, email, name } = data;

    // Validate input
    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    try {
      // Generate SEO report using the client-compatible analyzer
      console.log(`Generating SEO report for ${url}...`);
      
      const normalizedUrl = normalizeUrl(url);
      const seoAnalysisResult = analyzeSeo(normalizedUrl);
      
      // Map the SEO analysis results to our report format
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
      
      // Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated successfully',
        report: reportData
      });
    } catch (analysisError) {
      console.error('SEO analysis error:', analysisError);
      
      // If analysis fails, return a simplified report with basic information
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
        report: fallbackReport,
        error: `Analysis error: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
} 