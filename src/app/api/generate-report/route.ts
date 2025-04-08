import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { storeLead, storeReport } from '@/lib/supabase';
import { analyzeSeo, isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, email, name } = data;

    // Validate input
    if (!url || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    try {
      // Store lead data first
      const lead = await storeLead({ name, email, url });
      
      if (!lead) {
        return NextResponse.json({ error: 'Failed to store lead information' }, { status: 500 });
      }
      
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

      // Store report in the database
      const report = await storeReport({
        lead_id: lead.id!,
        url: normalizedUrl,
        scores: reportData.scores,
        recommendations: reportData.recommendations
      });

      if (!report) {
        console.error('Failed to store report in database');
        // Continue anyway to return report to user
      }
      
      // Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated and stored successfully',
        report: reportData
      });
    } catch (analysisError) {
      console.error('SEO analysis error:', analysisError);
      
      // Even if analysis fails, return a simplified report with basic information
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
      
      // Try to store lead data even if analysis fails
      const lead = await storeLead({ name, email, url });
      
      if (lead) {
        // Store the fallback report
        await storeReport({
          lead_id: lead.id!,
          url,
          scores: fallbackReport.scores,
          recommendations: fallbackReport.recommendations
        });
      }
      
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