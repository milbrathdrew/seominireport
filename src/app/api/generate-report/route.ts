import { NextResponse } from 'next/server';
import { storeLead, storeReport } from '@/lib/supabase';
import { ReportData } from '@/types/form';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
      // 2. Perform basic SEO analysis
      console.log(`Running SEO analysis for ${url}...`);
      
      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MiniSeoReport/1.0 SEO Analyzer'
        },
        timeout: 10000 // 10 seconds timeout
      });

      // Parse HTML
      const $ = cheerio.load(response.data);
      
      // Extract basic metadata
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
      const hasCanonical = $('link[rel="canonical"]').length > 0;
      const imageCount = $('img').length;
      const wordCount = $('body').text().trim().split(/\s+/).length;
      const hasH1 = $('h1').length > 0;
      const hasH2 = $('h2').length > 0;
      
      // Check headings structure
      let headingsStructure = true;
      if ($('h1').length === 0 && ($('h2').length > 0 || $('h3').length > 0)) {
        headingsStructure = false;
      }
      
      // Meta tags
      const hasMetaViewport = $('meta[name="viewport"]').length > 0;
      const hasMetaCharset = $('meta[charset]').length > 0;
      
      // Calculate scores
      const seoScore = calculateSeoScore(title, description, hasCanonical);
      const accessibilityScore = calculateAccessibilityScore($);
      const performanceScore = 80; // Placeholder
      const bestPracticesScore = calculateBestPracticesScore(hasFavicon, hasMetaViewport, hasMetaCharset);
      
      // Generate recommendations
      let recommendations: string[] = [];
      
      // Title recommendations
      if (!title) {
        recommendations.push("Add a title tag to your page");
      } else if (title.length < 10) {
        recommendations.push("Your title is too short. Make it more descriptive");
      } else if (title.length > 60) {
        recommendations.push("Your title is too long. Keep it under 60 characters for better SEO");
      }
      
      // Meta description recommendations
      if (!description) {
        recommendations.push("Add a meta description to your page");
      } else if (description.length < 50) {
        recommendations.push("Your meta description is too short. Aim for 50-160 characters");
      } else if (description.length > 160) {
        recommendations.push("Your meta description is too long. Keep it under 160 characters");
      }
      
      // Other recommendations
      if (!hasFavicon) recommendations.push("Add a favicon to your website");
      if (!hasCanonical) recommendations.push("Add a canonical URL to prevent duplicate content issues");
      if (!hasH1) recommendations.push("Add an H1 heading to your page");
      if (!hasH2) recommendations.push("Add H2 headings to organize your content");
      if (!headingsStructure) recommendations.push("Fix your heading structure - don't skip heading levels");
      if (wordCount < 300) recommendations.push("Add more content to your page. Aim for at least 300 words");
      if (imageCount === 0) recommendations.push("Add images to make your content more engaging");
      
      // Check for alt text on images
      const missingAltCount = $('img:not([alt])').length;
      if (missingAltCount > 0) {
        recommendations.push(`Add alt text to ${missingAltCount} image${missingAltCount > 1 ? 's' : ''}`);
      }
      
      if (!hasMetaViewport) {
        recommendations.push("Add a meta viewport tag for better mobile optimization");
      }
      
      if (!hasMetaCharset) {
        recommendations.push("Add a meta charset tag to specify character encoding");
      }
      
      // Filter and limit recommendations
      recommendations = recommendations.filter(Boolean).slice(0, 10);
      
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
        recommendations
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

// Simple scoring functions
function calculateSeoScore(title: string, description: string, hasCanonical: boolean): number {
  let score = 60; // Base score
  
  if (title) score += 10;
  if (title && title.length >= 10 && title.length <= 60) score += 5;
  
  if (description) score += 10;
  if (description && description.length >= 50 && description.length <= 160) score += 5;
  
  if (hasCanonical) score += 10;
  
  return Math.min(100, score);
}

function calculateAccessibilityScore($: cheerio.CheerioAPI): number {
  let score = 70; // Base score
  
  // Check for alt texts
  const images = $('img');
  const imagesWithAlt = $('img[alt]');
  
  if (images.length > 0) {
    const altRatio = imagesWithAlt.length / images.length;
    score += Math.round(altRatio * 20);
  } else {
    score += 20; // No images is considered good for this metric
  }
  
  // Check for heading structure
  if ($('h1').length > 0) score += 5;
  
  // Check for lang attribute
  if ($('html[lang]').length > 0) score += 5;
  
  return Math.min(100, score);
}

function calculateBestPracticesScore(
  hasFavicon: boolean, 
  hasMetaViewport: boolean, 
  hasMetaCharset: boolean
): number {
  let score = 70; // Base score
  
  if (hasFavicon) score += 10;
  if (hasMetaViewport) score += 10;
  if (hasMetaCharset) score += 10;
  
  return Math.min(100, score);
} 