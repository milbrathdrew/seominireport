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
      
      // Add priority information to recommendations
      const enhancedReportData = {
        ...reportData,
        actionableItems: seoAnalysisResult.recommendations.map((recommendation, index) => {
          // Determine category based on recommendation content
          let category = 'general';
          if (recommendation.toLowerCase().includes('title tag')) category = 'meta';
          else if (recommendation.toLowerCase().includes('description')) category = 'meta';
          else if (recommendation.toLowerCase().includes('heading')) category = 'content';
          else if (recommendation.toLowerCase().includes('h1') || recommendation.toLowerCase().includes('h2')) category = 'content';
          else if (recommendation.toLowerCase().includes('image')) category = 'media';
          else if (recommendation.toLowerCase().includes('mobile')) category = 'technical';
          else if (recommendation.toLowerCase().includes('load')) category = 'performance';
          else if (recommendation.toLowerCase().includes('link')) category = 'links';
          else if (recommendation.toLowerCase().includes('www')) category = 'technical';
          else if (recommendation.toLowerCase().includes('keyword')) category = 'keywords';
          
          // Determine priority based on recommendation position and content
          let priority = index < 3 ? 'high' : index < 6 ? 'medium' : 'low';
          
          // Certain types of recommendations have intrinsic priority
          if (recommendation.toLowerCase().includes('https') || 
              recommendation.toLowerCase().includes('mobile') ||
              recommendation.toLowerCase().includes('title tag')) {
            priority = 'high';
          }
          
          // Estimate effort required
          let effort = 'medium';
          if (recommendation.toLowerCase().includes('title') || 
              recommendation.toLowerCase().includes('description') ||
              recommendation.toLowerCase().includes('alt text')) {
            effort = 'low';
          } else if (recommendation.toLowerCase().includes('redesign') ||
                    recommendation.toLowerCase().includes('restructure')) {
            effort = 'high';
          }
          
          return {
            title: recommendation.split('.')[0] + '.',  // First sentence as title
            description: recommendation,
            category,
            priority,
            effort,
            impact: priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low'
          };
        }),
        priorityFixes: seoAnalysisResult.recommendations
          .slice(0, 3)
          .map((recommendation, index) => ({
            title: recommendation.split('.')[0] + '.',
            description: recommendation,
            impact: index === 0 ? 'high' : 'medium',
            effort: 'medium'
          }))
      };
      
      return NextResponse.json({ 
        success: true,
        report: enhancedReportData
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
      
      // Add actionable items to fallback report
      const enhancedFallbackReport = {
        ...fallbackReport,
        actionableItems: fallbackReport.recommendations.map((recommendation, index) => ({
          title: recommendation.split('.')[0] + '.',
          description: recommendation,
          category: 'general',
          priority: index === 0 ? 'high' : 'medium',
          effort: 'medium',
          impact: index === 0 ? 'high' : 'medium'
        }))
      };
      
      return NextResponse.json({ 
        success: true,
        message: 'Basic report generated with limited analysis',
        report: enhancedFallbackReport
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