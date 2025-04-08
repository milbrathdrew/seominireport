import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';
import { isValidUrl, normalizeUrl } from '@/lib/client-seo-analyzer';
import { analyzeSeoServer } from '@/lib/server-seo-analyzer';
import { validateEnvironmentVariables } from '@/lib/validate-env';

export async function POST(request: Request) {
  try {
    // First validate environment variables
    validateEnvironmentVariables();

    const data = await request.json();
    const { url } = data;

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
        },
        // Map actionable items from recommendations
        actionableItems: seoAnalysisResult.recommendations.map((recommendation, index) => {
          // Determine category based on recommendation content
          let category = 'general';
          if (recommendation.toLowerCase().includes('title tag') || recommendation.toLowerCase().includes('meta description')) {
            category = 'meta';
          } else if (recommendation.toLowerCase().includes('heading') || recommendation.toLowerCase().includes('content')) {
            category = 'content';
          } else if (recommendation.toLowerCase().includes('image')) {
            category = 'media';
          } else if (recommendation.toLowerCase().includes('mobile') || recommendation.toLowerCase().includes('viewport')) {
            category = 'mobile';
          } else if (recommendation.toLowerCase().includes('load') || recommendation.toLowerCase().includes('speed')) {
            category = 'performance';
          } else if (recommendation.toLowerCase().includes('link') || recommendation.toLowerCase().includes('internal')) {
            category = 'links';
          } else if (recommendation.toLowerCase().includes('https') || recommendation.toLowerCase().includes('canonical')) {
            category = 'technical';
          } else if (recommendation.toLowerCase().includes('alt text') || recommendation.toLowerCase().includes('contrast')) {
            category = 'accessibility';
          }
          
          // Determine priority based on impact
          let priority: 'high' | 'medium' | 'low' = 'medium';
          
          // High priority items
          if (
            recommendation.toLowerCase().includes('https') || 
            recommendation.toLowerCase().includes('h1') ||
            recommendation.toLowerCase().includes('title tag') ||
            recommendation.toLowerCase().includes('meta description') ||
            recommendation.toLowerCase().includes('mobile') ||
            index < 3
          ) {
            priority = 'high';
          } 
          // Low priority items
          else if (
            recommendation.toLowerCase().includes('open graph') ||
            recommendation.toLowerCase().includes('schema') ||
            index > 8
          ) {
            priority = 'low';
          }
          
          // Determine effort level
          let effort: 'high' | 'medium' | 'low' = 'medium';
          
          // Low effort items
          if (
            recommendation.toLowerCase().includes('title tag') ||
            recommendation.toLowerCase().includes('meta description') ||
            recommendation.toLowerCase().includes('alt text') ||
            recommendation.toLowerCase().includes('canonical')
          ) {
            effort = 'low';
          }
          // High effort items
          else if (
            recommendation.toLowerCase().includes('restructure') ||
            recommendation.toLowerCase().includes('fix mobile') ||
            recommendation.toLowerCase().includes('improve page load') ||
            recommendation.toLowerCase().includes('https')
          ) {
            effort = 'high';
          }
          
          // Determine impact
          let impact: 'high' | 'medium' | 'low' = priority;
          
          return {
            title: recommendation.split('.')[0] + '.',
            description: recommendation,
            category,
            priority,
            effort,
            impact
          };
        }),
        // Create priority fixes for the most impactful items
        priorityFixes: seoAnalysisResult.recommendations
          .slice(0, 5)
          .map((recommendation, index) => ({
            title: recommendation.split('.')[0] + '.',
            description: recommendation,
            impact: index < 2 ? 'high' : 'medium',
            effort: recommendation.toLowerCase().includes('title') || recommendation.toLowerCase().includes('meta') 
              ? 'low' 
              : recommendation.toLowerCase().includes('https') || recommendation.toLowerCase().includes('speed')
              ? 'high'
              : 'medium'
          }))
      };
      
      // Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated successfully using server-side analysis',
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
      
      return NextResponse.json({ 
        success: true,
        message: 'Basic report generated with limited analysis due to technical issues',
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