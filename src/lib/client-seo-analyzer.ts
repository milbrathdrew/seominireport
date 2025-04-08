/**
 * Client-compatible SEO analyzer
 * This version uses only built-in APIs and avoids problematic dependencies
 */

// Types for our SEO analysis
export interface SeoAnalysisResult {
  url: string;
  scores: {
    metaScore: number;
    technicalScore: number;
    contentScore: number;
    overallScore: number;
  };
  technicalAnalysis: {
    httpsProtocol: boolean;
    domainHasWww: boolean;
    domainStructure: string;
    pathDepth: number;
    hasQueryParams: boolean;
    hasFragment: boolean;
  };
  recommendations: string[];
  errors: string[];
}

/**
 * Normalizes a URL by ensuring it has the proper protocol
 */
export function normalizeUrl(url: string): string {
  // Add https:// if no protocol is specified
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Validates if a string is a properly formatted URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Analyzes URL structure and patterns
 */
function analyzeUrlStructure(url: string): SeoAnalysisResult['technicalAnalysis'] {
  const normalizedUrl = normalizeUrl(url);
  const urlObj = new URL(normalizedUrl);
  
  // Domain segments (e.g., "www.example.com" => ["www", "example", "com"])
  const domainSegments = urlObj.hostname.split('.');
  
  // Path depth (e.g., "/blog/post/123" => 3)
  const pathDepth = urlObj.pathname === '/' 
    ? 0 
    : urlObj.pathname.split('/').filter(segment => segment.length > 0).length;
  
  // Domain structure analysis
  let domainStructure = 'Other';
  if (domainSegments.length === 2) {
    domainStructure = 'Root Domain';
  } else if (domainSegments.length === 3 && domainSegments[0] === 'www') {
    domainStructure = 'WWW Subdomain';
  } else if (domainSegments.length === 3) {
    domainStructure = 'Subdomain';
  } else if (domainSegments.length > 3) {
    domainStructure = 'Multi-level Subdomain';
  }
  
  return {
    httpsProtocol: urlObj.protocol === 'https:',
    domainHasWww: urlObj.hostname.startsWith('www.'),
    domainStructure,
    pathDepth,
    hasQueryParams: urlObj.search.length > 0,
    hasFragment: urlObj.hash.length > 0
  };
}

/**
 * Calculates SEO scores based on URL analysis
 */
function calculateScores(urlAnalysis: SeoAnalysisResult['technicalAnalysis']): SeoAnalysisResult['scores'] {
  // Technical score (0-100)
  let technicalScore = 0;
  
  // HTTPS protocol (20 points)
  if (urlAnalysis.httpsProtocol) {
    technicalScore += 20;
  }
  
  // Domain structure (10 points)
  if (urlAnalysis.domainStructure === 'WWW Subdomain' || urlAnalysis.domainStructure === 'Root Domain') {
    technicalScore += 10;
  } else if (urlAnalysis.domainStructure === 'Subdomain') {
    technicalScore += 5;
  }
  
  // Path depth (15 points)
  if (urlAnalysis.pathDepth === 0) {
    technicalScore += 15; // Homepage
  } else if (urlAnalysis.pathDepth <= 2) {
    technicalScore += 10; // Shallow paths
  } else if (urlAnalysis.pathDepth <= 4) {
    technicalScore += 5; // Medium paths
  }
  
  // Query parameters (5 points)
  if (!urlAnalysis.hasQueryParams) {
    technicalScore += 5;
  }
  
  // Default scores for meta and content
  // We'll set reasonable defaults since we can't analyze actual content
  const metaScore = 60; // Moderate score since we can't check actual meta tags
  const contentScore = 50; // Neutral score since we can't analyze content
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (technicalScore * 0.4) + 
    (metaScore * 0.3) + 
    (contentScore * 0.3)
  );
  
  return {
    technicalScore,
    metaScore,
    contentScore,
    overallScore
  };
}

/**
 * Generates SEO recommendations based on URL analysis
 */
function generateRecommendations(
  url: string, 
  urlAnalysis: SeoAnalysisResult['technicalAnalysis']
): string[] {
  const recommendations: string[] = [];
  
  // HTTPS recommendations
  if (!urlAnalysis.httpsProtocol) {
    recommendations.push('Implement HTTPS to secure your website and improve search rankings.');
  }
  
  // WWW recommendations
  if (!urlAnalysis.domainHasWww && urlAnalysis.domainStructure === 'Root Domain') {
    recommendations.push('Consider using a consistent www or non-www version of your domain and set up proper redirects.');
  }
  
  // Path depth recommendations
  if (urlAnalysis.pathDepth > 3) {
    recommendations.push('Your URL path is quite deep. Consider a flatter site structure for better SEO.');
  }
  
  // Query parameters
  if (urlAnalysis.hasQueryParams) {
    recommendations.push('Your URL contains query parameters. Consider using clean, descriptive URLs without parameters when possible.');
  }
  
  // Fragment identifiers
  if (urlAnalysis.hasFragment) {
    recommendations.push('Your URL contains a fragment identifier (#). Search engines typically ignore content after the #.');
  }
  
  // General SEO recommendations
  recommendations.push('Ensure your page has a descriptive title tag (ideally 50-60 characters).');
  recommendations.push('Add a meta description that summarizes your page content (ideally 150-160 characters).');
  recommendations.push('Use a single H1 heading that clearly describes your page content.');
  recommendations.push('Structure your content with H2-H6 subheadings for better readability and SEO.');
  recommendations.push('Include relevant keywords in your content naturally, avoiding keyword stuffing.');
  recommendations.push('Optimize images with descriptive file names and ALT text.');
  recommendations.push('Ensure your website is mobile-friendly and loads quickly.');
  recommendations.push('Add internal links to other relevant pages on your site.');
  recommendations.push('Include external links to authoritative sources when appropriate.');
  
  return recommendations;
}

/**
 * Main function to analyze a URL for SEO
 */
export function analyzeSeo(url: string): SeoAnalysisResult {
  const errors: string[] = [];
  
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL provided');
  }
  
  try {
    const normalizedUrl = normalizeUrl(url);
    
    // Analyze URL structure
    const urlAnalysis = analyzeUrlStructure(normalizedUrl);
    
    // Calculate scores
    const scores = calculateScores(urlAnalysis);
    
    // Generate recommendations
    const recommendations = generateRecommendations(normalizedUrl, urlAnalysis);
    
    // Return the analysis result
    return {
      url: normalizedUrl,
      scores,
      technicalAnalysis: urlAnalysis,
      recommendations,
      errors
    };
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Error analyzing URL: ${error.message}`);
    } else {
      errors.push('Error analyzing URL: Unknown error');
    }
    
    throw new Error(`Failed to analyze SEO: ${errors.join(', ')}`);
  }
} 