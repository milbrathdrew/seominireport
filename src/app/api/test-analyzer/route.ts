import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }
  
  try {
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
    const imageCount = $('img').length;
    const wordCount = $('body').text().trim().split(/\s+/).length;
    const hasH1 = $('h1').length > 0;
    
    // Generate a basic scores
    const scores = {
      performance: 80,
      accessibility: hasH1 ? 85 : 70,
      seo: title && description ? 90 : 65,
      bestPractices: hasFavicon ? 85 : 70
    };
    
    // Basic recommendations
    const recommendations = [];
    
    if (!title) recommendations.push("Add a title tag to your page");
    if (!description) recommendations.push("Add a meta description to your page");
    if (!hasFavicon) recommendations.push("Add a favicon to your website");
    if (!hasH1) recommendations.push("Add an H1 heading to your page");
    if (wordCount < 300) recommendations.push("Add more content to your page");
    if (imageCount === 0) recommendations.push("Add images to make your content more engaging");
    
    return NextResponse.json({
      success: true,
      url,
      analysis: {
        scores,
        recommendations,
        metadata: {
          title,
          description,
          hasFavicon,
          imageCount,
          wordCount,
          hasH1
        }
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 