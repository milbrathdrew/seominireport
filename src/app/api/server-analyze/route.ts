import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';
import { analyzeSeoServer } from '@/lib/server-seo-analyzer';
import { validateEnvironmentVariables } from '@/lib/validateEnvironment';
import { storeLead, storeReport } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // First validate environment variables
    validateEnvironmentVariables();

    const data = await request.json();
    const { url, email, name } = data;

    // Validate input
    if (!url) {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required' 
      }, { status: 400 });
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid URL format' 
      }, { status: 400 });
    }

    // Additional validation for database storage
    if (!email) {
      return NextResponse.json({ 
        success: false,
        message: 'Email is required to save results' 
      }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ 
        success: false,
        message: 'Name is required to save results' 
      }, { status: 400 });
    }

    // Store lead data first
    const leadResult = await storeLead({ name, email, url });
    if (!leadResult || !leadResult.id) {
      console.error('Failed to store lead information');
      // Continue with analysis but note the database storage failure
    }

    try {
      // Normalize the URL first
      const normalizedUrl = normalizeUrl(url);
      
      // Perform server-side SEO analysis
      console.log(`Starting server-side analysis for ${normalizedUrl}...`);
      const seoAnalysisResult = await analyzeSeoServer(normalizedUrl);
      
      console.log(`Analysis completed with ${seoAnalysisResult.recommendations.length} recommendations`);
      
      // Convert result to report format
      const reportData: ReportData = {
        url: normalizedUrl,
        date: new Date().toISOString(),
        scores: {
          seo: seoAnalysisResult.scores.seo,
          performance: seoAnalysisResult.scores.performance,
          accessibility: seoAnalysisResult.scores.accessibility,
          bestPractices: seoAnalysisResult.scores.bestPractices
        },
        recommendations: seoAnalysisResult.recommendations,
        analysisDetails: {
          technical: {
            httpsProtocol: seoAnalysisResult.technical.httpsProtocol,
            domainHasWww: seoAnalysisResult.technical.domainHasWww,
            domainStructure: seoAnalysisResult.technical.domainStructure,
            pathDepth: seoAnalysisResult.technical.pathDepth,
            hasQueryParams: seoAnalysisResult.technical.hasQueryParams,
            hasFragment: seoAnalysisResult.technical.hasFragment,
            loadTime: seoAnalysisResult.technical.loadTime,
            statusCode: seoAnalysisResult.technical.statusCode,
            mobileViewport: seoAnalysisResult.technical.mobileViewport
          },
          overallScore: seoAnalysisResult.scores.overall,
          metadata: seoAnalysisResult.metadata,
          content: seoAnalysisResult.content
        }
      };
      
      // Store the report in the database if lead storage was successful
      let reportId: string | undefined;
      
      if (leadResult && leadResult.id) {
        // Prepare database-friendly report structure
        const databaseReport = {
          lead_id: leadResult.id,
          url: normalizedUrl,
          scores: reportData.scores,
          recommendations: reportData.recommendations,
          technical_details: reportData.analysisDetails?.technical || {},
        };
        
        // Store the report
        console.log('Storing report in database...');
        const storeResult = await storeReport(databaseReport as any);
        
        if (storeResult) {
          console.log('Report stored successfully with ID:', storeResult.id);
          reportId = storeResult.id;
          
          // Action items creation has been disabled
        } else {
          console.error('Failed to store report in database');
        }
      }
      
      // Return success response with report data and ID if available
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated successfully using server-side analysis',
        reportId,
        report: reportData
      });
    } catch (analysisError) {
      // Log the full error server-side
      console.error('Server SEO analysis error:', analysisError);
      
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
          "Our analysis tool might be experiencing temporary issues.",
          "Try again later or contact support if the problem persists."
        ],
        analysisError: analysisError instanceof Error ? analysisError.message : String(analysisError)
      };
      
      // Try to store the fallback report if lead storage was successful
      let fallbackReportId: string | undefined;
      
      if (leadResult && leadResult.id) {
        const fallbackDatabaseReport = {
          lead_id: leadResult.id,
          url,
          scores: fallbackReport.scores,
          recommendations: fallbackReport.recommendations
        };
        
        const fallbackStoreResult = await storeReport(fallbackDatabaseReport as any);
        
        if (fallbackStoreResult) {
          console.log('Fallback report stored with ID:', fallbackStoreResult.id);
          fallbackReportId = fallbackStoreResult.id;
        }
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Basic report generated with limited analysis due to technical issues',
        reportId: fallbackReportId,
        report: fallbackReport
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process request'
    }, { status: 500 });
  }
} 