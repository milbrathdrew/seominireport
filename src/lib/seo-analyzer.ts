import axios from 'axios';
import * as cheerio from 'cheerio';

// Types for SEO analysis results
export type SeoAnalysisResult = {
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  recommendations: string[];
  metadata: {
    title: string;
    description: string;
    hasFavicon: boolean;
    hasCanonical: boolean;
    imageCount: number;
    wordCount: number;
    hasH1: boolean;
    hasH2: boolean;
    headingsStructure: boolean;
  };
};

/**
 * Analyze the SEO of a webpage
 */
export async function analyzeSeo(url: string): Promise<SeoAnalysisResult> {
  try {
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL format: ${url}`);
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MiniSeoReport/1.0 SEO Analyzer'
      },
      timeout: 10000 // 10 seconds timeout
    });

    // Parse HTML
    const $ = cheerio.load(response.data);
    
    // Extract metadata
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    const hasCanonical = $('link[rel="canonical"]').length > 0;
    const imageCount = $('img').length;
    const wordCount = $('body').text().trim().split(/\s+/).length;
    const hasH1 = $('h1').length > 0;
    const hasH2 = $('h2').length > 0;
    
    // Check headings structure (h1 -> h2 -> h3, not skipping levels)
    let headingsStructure = true;
    if ($('h1').length === 0 && ($('h2').length > 0 || $('h3').length > 0)) {
      headingsStructure = false;
    }
    if ($('h2').length === 0 && $('h3').length > 0) {
      headingsStructure = false;
    }

    // Analyze meta tags
    const hasMetaViewport = $('meta[name="viewport"]').length > 0;
    const hasMetaCharset = $('meta[charset]').length > 0;
    const hasMetaRobots = $('meta[name="robots"]').length > 0;
    
    // Calculate scores based on analysis
    const metadataScore = calculateMetadataScore(title, description, hasFavicon, hasCanonical);
    const contentScore = calculateContentScore(hasH1, hasH2, headingsStructure, wordCount, imageCount);
    const technicalScore = calculateTechnicalScore(hasMetaViewport, hasMetaCharset, hasMetaRobots, response.data);
    const accessibilityScore = calculateAccessibilityScore($);
    
    // Generate recommendations
    const recommendations = generateRecommendations(
      title, description, hasFavicon, hasCanonical, hasH1, 
      hasH2, headingsStructure, imageCount, wordCount, 
      hasMetaViewport, hasMetaCharset, hasMetaRobots, $
    );

    return {
      scores: {
        performance: 80, // This is a placeholder, actual performance would need Lighthouse
        accessibility: accessibilityScore,
        seo: Math.round((metadataScore + contentScore + technicalScore) / 3),
        bestPractices: technicalScore
      },
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      metadata: {
        title,
        description,
        hasFavicon,
        hasCanonical,
        imageCount,
        wordCount,
        hasH1,
        hasH2,
        headingsStructure
      }
    };
  } catch (error) {
    console.error('SEO analysis error:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to fetch URL (${error.response.status}): ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Calculate metadata score based on best practices
 */
function calculateMetadataScore(
  title: string, 
  description: string, 
  hasFavicon: boolean, 
  hasCanonical: boolean
): number {
  let score = 0;
  const total = 100;
  
  // Title checks (30 points)
  if (title) score += 10;
  if (title.length >= 10 && title.length <= 60) score += 10;
  if (!title.includes('|') && !title.includes('-') && !title.includes(':')) score += 5;
  if (title.length < 10) score += 5;
  
  // Meta description checks (30 points)
  if (description) score += 10;
  if (description.length >= 50 && description.length <= 160) score += 15;
  if (description.length > 0 && description.length < 50) score += 5;
  
  // Favicon (10 points)
  if (hasFavicon) score += 10;
  
  // Canonical URL (10 points)
  if (hasCanonical) score += 10;
  
  // Additional metadata factors (20 points)
  score += 20; // Placeholder for other metadata factors
  
  return Math.min(100, Math.round(score));
}

/**
 * Calculate content score based on best practices
 */
function calculateContentScore(
  hasH1: boolean, 
  hasH2: boolean, 
  headingsStructure: boolean, 
  wordCount: number, 
  imageCount: number
): number {
  let score = 0;
  const total = 100;
  
  // Headings checks (40 points)
  if (hasH1) score += 15;
  if (hasH2) score += 10;
  if (headingsStructure) score += 15;
  
  // Content length check (30 points)
  if (wordCount >= 300) score += 15;
  if (wordCount >= 600) score += 15;
  
  // Image usage (20 points)
  if (imageCount > 0) score += 10;
  if (imageCount > 0 && wordCount / imageCount <= 300 && wordCount / imageCount >= 75) score += 10;
  
  // Additional content factors (10 points)
  score += 10; // Placeholder for other content factors
  
  return Math.min(100, Math.round(score));
}

/**
 * Calculate technical SEO score
 */
function calculateTechnicalScore(
  hasMetaViewport: boolean, 
  hasMetaCharset: boolean, 
  hasMetaRobots: boolean, 
  html: string
): number {
  let score = 0;
  const total = 100;
  
  // Meta tags (30 points)
  if (hasMetaViewport) score += 10;
  if (hasMetaCharset) score += 10;
  if (hasMetaRobots) score += 10;
  
  // Page size (20 points)
  const pageSize = html.length / 1024; // KB
  if (pageSize < 100) score += 20;
  else if (pageSize < 200) score += 15;
  else if (pageSize < 300) score += 10;
  else if (pageSize < 400) score += 5;
  
  // Schema markup check (20 points)
  if (html.includes('application/ld+json') || html.includes('itemscope') || html.includes('itemtype')) {
    score += 20;
  }
  
  // Mobile friendly (10 points)
  if (hasMetaViewport && html.includes('width=device-width')) {
    score += 10;
  }
  
  // Additional technical factors (20 points)
  score += 20; // Placeholder for other technical factors
  
  return Math.min(100, Math.round(score));
}

/**
 * Calculate accessibility score
 */
function calculateAccessibilityScore($: cheerio.CheerioAPI): number {
  let score = 0;
  const total = 100;
  
  // Alt text for images (20 points)
  const images = $('img');
  let imagesWithAlt = 0;
  
  images.each((i, el) => {
    if ($(el).attr('alt')) {
      imagesWithAlt++;
    }
  });
  
  const altTextScore = images.length > 0 ? (imagesWithAlt / images.length) * 20 : 20;
  score += Math.round(altTextScore);
  
  // Form labels (20 points)
  const formFields = $('input, select, textarea').not('[type="submit"], [type="button"], [type="reset"], [type="hidden"]');
  let fieldsWithLabels = 0;
  
  formFields.each((i, el) => {
    const id = $(el).attr('id');
    if (id && $(`label[for="${id}"]`).length > 0) {
      fieldsWithLabels++;
    }
  });
  
  const formLabelScore = formFields.length > 0 ? (fieldsWithLabels / formFields.length) * 20 : 20;
  score += Math.round(formLabelScore);
  
  // Color contrast (estimated, 20 points)
  // This is a placeholder - real contrast checking requires CSS processing
  score += 15;
  
  // ARIA landmarks (20 points)
  const hasMainLandmark = $('main, [role="main"]').length > 0;
  const hasNavLandmark = $('nav, [role="navigation"]').length > 0;
  const hasHeaderLandmark = $('header, [role="banner"]').length > 0;
  const hasFooterLandmark = $('footer, [role="contentinfo"]').length > 0;
  
  if (hasMainLandmark) score += 5;
  if (hasNavLandmark) score += 5;
  if (hasHeaderLandmark) score += 5;
  if (hasFooterLandmark) score += 5;
  
  // Additional accessibility factors (20 points)
  score += 10; // Placeholder for other accessibility factors
  
  // Check for language attribute
  if ($('html[lang]').length > 0) {
    score += 10;
  }
  
  return Math.min(100, Math.round(score));
}

/**
 * Generate recommendations based on the analysis
 */
function generateRecommendations(
  title: string, 
  description: string, 
  hasFavicon: boolean, 
  hasCanonical: boolean, 
  hasH1: boolean, 
  hasH2: boolean, 
  headingsStructure: boolean, 
  imageCount: number, 
  wordCount: number, 
  hasMetaViewport: boolean, 
  hasMetaCharset: boolean, 
  hasMetaRobots: boolean,
  $: cheerio.CheerioAPI
): string[] {
  const recommendations: string[] = [];
  
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
  
  // Favicon recommendation
  if (!hasFavicon) {
    recommendations.push("Add a favicon to your website");
  }
  
  // Canonical URL recommendation
  if (!hasCanonical) {
    recommendations.push("Add a canonical URL to prevent duplicate content issues");
  }
  
  // Headings recommendations
  if (!hasH1) {
    recommendations.push("Add an H1 heading to your page");
  }
  if (!hasH2) {
    recommendations.push("Add H2 headings to organize your content");
  }
  if (!headingsStructure) {
    recommendations.push("Fix your heading structure - don't skip heading levels");
  }
  
  // Content recommendations
  if (wordCount < 300) {
    recommendations.push("Add more content to your page. Aim for at least 300 words");
  }
  if (imageCount === 0) {
    recommendations.push("Add images to make your content more engaging");
  }
  
  // Alt text recommendations
  const missingAltCount = $('img:not([alt])').length;
  if (missingAltCount > 0) {
    recommendations.push(`Add alt text to ${missingAltCount} image${missingAltCount > 1 ? 's' : ''}`);
  }
  
  // Meta viewport recommendation
  if (!hasMetaViewport) {
    recommendations.push("Add a meta viewport tag for better mobile optimization");
  }
  
  // Meta charset recommendation
  if (!hasMetaCharset) {
    recommendations.push("Add a meta charset tag to specify character encoding");
  }
  
  // Form label recommendations
  const formFieldsMissingLabels = $('input:not([type="submit"], [type="button"], [type="reset"], [type="hidden"])').filter((i, el) => {
    const id = $(el).attr('id');
    return !id || $(`label[for="${id}"]`).length === 0;
  }).length;
  
  if (formFieldsMissingLabels > 0) {
    recommendations.push(`Add proper labels to ${formFieldsMissingLabels} form field${formFieldsMissingLabels > 1 ? 's' : ''}`);
  }
  
  // ARIA landmarks recommendations
  if ($('main, [role="main"]').length === 0) {
    recommendations.push("Add a main landmark for better accessibility");
  }
  
  // Language attribute recommendation
  if ($('html[lang]').length === 0) {
    recommendations.push("Add a lang attribute to your HTML tag");
  }
  
  return recommendations;
} 