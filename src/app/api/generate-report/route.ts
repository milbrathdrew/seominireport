import { NextResponse } from 'next/server';
import { storeLead, storeReport } from '@/lib/supabase';
import { ReportData } from '@/types/form';
import { analyzeSeo } from '@/lib/seo-analyzer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, email, name } = data;

    // Validate input
    if (!url || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Store lead information
    const lead = await storeLead({ name, email, url });
    
    if (!lead) {
      return NextResponse.json({ error: 'Failed to store lead information' }, { status: 500 });
    }

    try {
      // 2. Run SEO analysis
      console.log(`Running SEO analysis for ${url}...`);
      const analysis = await analyzeSeo(url);
      
      // Create report data from analysis
      const reportData: ReportData = {
        url,
        date: new Date().toISOString(),
        scores: analysis.scores,
        recommendations: analysis.recommendations
      };

      // 3. Store report in database
      const report = await storeReport({
        lead_id: lead.id as string,
        url,
        scores: reportData.scores,
        recommendations: reportData.recommendations
      });

      if (!report) {
        return NextResponse.json({ error: 'Failed to store report data' }, { status: 500 });
      }

      // 4. Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated and stored successfully',
        reportId: report.id,
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
      
      // Try to store the fallback report
      const report = await storeReport({
        lead_id: lead.id as string,
        url,
        scores: fallbackReport.scores,
        recommendations: fallbackReport.recommendations
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Basic report generated with limited analysis',
        reportId: report?.id,
        report: fallbackReport,
        error: `Analysis error: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
} 