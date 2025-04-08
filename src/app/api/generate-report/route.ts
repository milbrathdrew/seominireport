import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { analyzeSeo, isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';
import { storeLead, storeReport, createActionItemsFromRecommendations } from '@/lib/supabase';
import { validateEnvironmentVariables } from '@/lib/validate-env';

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

    if (!email) {
      return NextResponse.json({ 
        success: false,
        message: 'Email is required' 
      }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ 
        success: false,
        message: 'Name is required' 
      }, { status: 400 });
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid URL format' 
      }, { status: 400 });
    }

    // Store lead data
    const leadResult = await storeLead({ name, email, url });
    if (!leadResult || !leadResult.id) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to store lead information'
      }, { status: 500 });
    }

    // Generate SEO report
    try {
      // Normalize the URL first
      const normalizedUrl = normalizeUrl(url);
      
      // Perform SEO analysis
      const seoAnalysisResult = await analyzeSeo(normalizedUrl);
      
      // Convert result to report format
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
        analysisDetails: {
          technical: seoAnalysisResult.technicalAnalysis,
          overallScore: seoAnalysisResult.scores.overallScore
        }
      };
      
      // Enhanced report data with technical details
      const enhancedReportData = {
        lead_id: leadResult.id,
        url: normalizedUrl,
        scores: reportData.scores,
        recommendations: reportData.recommendations,
        technical_details: {
          httpsProtocol: seoAnalysisResult.technicalAnalysis.httpsProtocol,
          domainHasWww: seoAnalysisResult.technicalAnalysis.domainHasWww,
          domainStructure: seoAnalysisResult.technicalAnalysis.domainStructure,
          pathDepth: seoAnalysisResult.technicalAnalysis.pathDepth,
          hasQueryParams: seoAnalysisResult.technicalAnalysis.hasQueryParams,
          hasFragment: seoAnalysisResult.technicalAnalysis.hasFragment
        }
      };
      
      // Create priority fixes array based on recommendations
      const priorityFixes = seoAnalysisResult.recommendations
        .slice(0, 3)
        .map((recommendation, index) => ({
          title: recommendation.split('.')[0] + '.',
          description: recommendation,
          impact: index === 0 ? 'high' : 'medium',
          effort: 'medium'
        }));
      
      // Add priority_fixes to the enhanced report data as any to bypass TypeScript checking
      (enhancedReportData as any).priority_fixes = priorityFixes;
      
      // Log what we're trying to store
      console.log('Storing report data with structure:', JSON.stringify({
        ...enhancedReportData,
        priority_fixes: 'Array with ' + priorityFixes.length + ' items'
      }, null, 2));
      
      // Store the report in the database
      const storeResult = await storeReport(enhancedReportData as any);
      
      if (!storeResult) {
        console.error('Failed to store report in database');
        // Continue anyway to at least return the report to the user
      } else {
        console.log('Successfully stored report with ID:', storeResult.id);
        
        // Create structured action items from recommendations
        await createActionItemsFromRecommendations(
          storeResult.id as string,
          reportData.recommendations
        );
      }
      
      // Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated successfully',
        report: reportData
      });
    } catch (analysisError) {
      // Log the full error server-side
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
      
      // Create basic priority fixes for fallback
      const fallbackPriorityFixes = fallbackReport.recommendations.map((rec, index) => ({
        title: rec.split('.')[0] + '.',
        description: rec,
        impact: 'medium',
        effort: 'medium'
      }));
      
      // Store the fallback report as well
      const fallbackReportData = {
        lead_id: leadResult.id,
        url,
        scores: fallbackReport.scores,
        recommendations: fallbackReport.recommendations,
        priority_fixes: fallbackPriorityFixes
      };
      
      // Store the fallback report with type assertion
      const fallbackStoreResult = await storeReport(fallbackReportData as any);
      
      // Log result of storing fallback report
      if (fallbackStoreResult) {
        console.log('Successfully stored fallback report with ID:', fallbackStoreResult.id);
        
        // Create basic action items for the fallback report
        await createActionItemsFromRecommendations(
          fallbackStoreResult.id as string,
          fallbackReport.recommendations
        );
      } else {
        console.error('Failed to store fallback report in database');
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Basic report generated with limited analysis',
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