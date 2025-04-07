import { NextResponse } from 'next/server';
import { storeLead, storeReport } from '@/lib/supabase';
import { ReportData } from '@/types/form';

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

    // 2. For now, we'll just use mock data for the report
    // In a real implementation, this would run Lighthouse analysis
    const mockReport: ReportData = {
      url,
      date: new Date().toISOString(),
      scores: {
        performance: 85,
        accessibility: 90,
        seo: 78,
        bestPractices: 92
      },
      recommendations: [
        "Add meta description to improve SEO score",
        "Optimize images to improve performance",
        "Fix heading hierarchy for better accessibility",
        "Add alt attributes to images"
      ]
    };

    // 3. Store report in database
    const report = await storeReport({
      lead_id: lead.id as string,
      url,
      scores: mockReport.scores,
      recommendations: mockReport.recommendations
    });

    if (!report) {
      return NextResponse.json({ error: 'Failed to store report data' }, { status: 500 });
    }

    // 4. Return success response with report data
    return NextResponse.json({ 
      success: true, 
      message: 'Report generated and stored successfully',
      reportId: report.id,
      report: mockReport
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
} 