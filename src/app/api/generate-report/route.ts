import { NextResponse } from 'next/server';
import { ReportData } from '@/types/form';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, email, name } = data;

    // Validate input
    if (!url || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      // Generate SEO report (mock data for now)
      console.log(`Generating SEO report for ${url}...`);
      
      // Calculate basic scores based on the URL
      const urlObj = new URL(url);
      const isDomain = urlObj.pathname === '/';
      const hasWww = urlObj.hostname.startsWith('www.');
      const isHttps = urlObj.protocol === 'https:';
      
      // Simple scoring based on URL patterns
      const seoScore = isHttps ? 90 : 70;
      const performanceScore = hasWww ? 85 : 75;
      const accessibilityScore = Math.floor(Math.random() * 20) + 75; // Random score between 75-95
      const bestPracticesScore = isDomain ? 85 : 80;
      
      // Generate recommendations based on URL
      const recommendations = [
        "Add meta description to improve SEO score",
        "Optimize images to improve performance",
        "Fix heading hierarchy for better accessibility",
        "Add alt attributes to images"
      ];
      
      if (!isHttps) {
        recommendations.push("Upgrade to HTTPS for better security and SEO");
      }
      
      if (!hasWww) {
        recommendations.push("Consider adding www subdomain for consistency");
      }
      
      if (!isDomain) {
        recommendations.push("Include breadcrumbs for better navigation");
        recommendations.push("Ensure proper canonical URLs");
      }
      
      // Create report data
      const reportData: ReportData = {
        url,
        date: new Date().toISOString(),
        scores: {
          performance: performanceScore,
          accessibility: accessibilityScore,
          seo: seoScore,
          bestPractices: bestPracticesScore
        },
        recommendations: recommendations.slice(0, 10) // Top 10 recommendations
      };

      // Return success response with report data
      return NextResponse.json({ 
        success: true, 
        message: 'Report generated successfully',
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