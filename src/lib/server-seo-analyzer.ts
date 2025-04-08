/**
 * Server-side SEO analyzer
 * This provides advanced SEO analysis capabilities using web crawling
 */

import puppeteer from 'puppeteer';
import { isValidUrl, normalizeUrl } from './client-seo-analyzer';

// Types for SEO analysis
export interface ServerSeoAnalysisResult {
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
    overall: number;
  };
  metadata: {
    title: string;
    description: string;
    canonical: string | null;
    ogTags: Record<string, string>;
    schema: any[];
  };
  content: {
    headingStructure: {
      h1Count: number;
      h2Count: number;
      h3Count: number;
      otherHeadingsCount: number;
      hasProperHeadingOrder: boolean;
    };
    wordCount: number;
    paragraphCount: number;
    linkCount: {
      internal: number;
      external: number;
    };
    images: {
      count: number;
      withAlt: number;
      withoutAlt: number;
    };
  };
  technical: {
    httpsProtocol: boolean;
    domainHasWww: boolean;
    domainStructure: string;
    pathDepth: number;
    hasQueryParams: boolean;
    hasFragment: boolean;
    loadTime: number;
    mobileViewport: {
      renders: boolean;
      responsive: boolean;
    };
    statusCode: number;
  };
  recommendations: string[];
  errors: string[];
}

/**
 * Main function to analyze a URL for SEO using server-side capabilities
 */
export async function analyzeSeoServer(url: string): Promise<ServerSeoAnalysisResult> {
  // Default result structure with initial values
  const result: ServerSeoAnalysisResult = {
    url: normalizeUrl(url),
    scores: {
      performance: 0,
      accessibility: 0,
      seo: 0,
      bestPractices: 0,
      overall: 0
    },
    metadata: {
      title: '',
      description: '',
      canonical: null,
      ogTags: {},
      schema: []
    },
    content: {
      headingStructure: {
        h1Count: 0,
        h2Count: 0,
        h3Count: 0,
        otherHeadingsCount: 0,
        hasProperHeadingOrder: false
      },
      wordCount: 0,
      paragraphCount: 0,
      linkCount: {
        internal: 0,
        external: 0
      },
      images: {
        count: 0,
        withAlt: 0,
        withoutAlt: 0
      }
    },
    technical: {
      httpsProtocol: false,
      domainHasWww: false,
      domainStructure: '',
      pathDepth: 0,
      hasQueryParams: false,
      hasFragment: false,
      loadTime: 0,
      mobileViewport: {
        renders: false,
        responsive: false
      },
      statusCode: 0
    },
    recommendations: [],
    errors: []
  };

  // Validate the URL
  if (!isValidUrl(url)) {
    result.errors.push('Invalid URL provided');
    return result;
  }

  // Normalize the URL
  const normalizedUrl = normalizeUrl(url);
  result.url = normalizedUrl;

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Start performance measurement
    const startTime = Date.now();

    // Create a page
    const page = await browser.newPage();
    
    // Set mobile viewport for testing
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    // Enable request interception for status code
    await page.setRequestInterception(true);
    
    // Track status code
    let statusCode = 0;
    page.on('request', request => {
      request.continue();
    });
    
    page.on('response', response => {
      if (response.url() === normalizedUrl) {
        statusCode = response.status();
      }
    });

    // Navigate to URL with timeout
    await page.goto(normalizedUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Stop performance measurement
    const loadTime = Date.now() - startTime;
    result.technical.loadTime = loadTime;
    result.technical.statusCode = statusCode;

    // Technical analysis from URL
    const urlObj = new URL(normalizedUrl);
    result.technical.httpsProtocol = urlObj.protocol === 'https:';
    result.technical.domainHasWww = urlObj.hostname.startsWith('www.');
    
    // Domain segments (e.g., "www.example.com" => ["www", "example", "com"])
    const domainSegments = urlObj.hostname.split('.');
    
    // Domain structure analysis
    if (domainSegments.length === 2) {
      result.technical.domainStructure = 'Root Domain';
    } else if (domainSegments.length === 3 && domainSegments[0] === 'www') {
      result.technical.domainStructure = 'WWW Subdomain';
    } else if (domainSegments.length === 3) {
      result.technical.domainStructure = 'Subdomain';
    } else if (domainSegments.length > 3) {
      result.technical.domainStructure = 'Multi-level Subdomain';
    } else {
      result.technical.domainStructure = 'Other';
    }
    
    // Path depth (e.g., "/blog/post/123" => 3)
    result.technical.pathDepth = urlObj.pathname === '/' 
      ? 0 
      : urlObj.pathname.split('/').filter(segment => segment.length > 0).length;
      
    result.technical.hasQueryParams = urlObj.search.length > 0;
    result.technical.hasFragment = urlObj.hash.length > 0;

    // Extract metadata
    result.metadata.title = await page.title();
    result.metadata.description = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content') || '')
      .catch(() => '');
    
    result.metadata.canonical = await page.$eval('link[rel="canonical"]', (el) => el.getAttribute('href') || '')
      .catch(() => null);
    
    // Open Graph tags
    const ogTags = await page.$$eval('meta[property^="og:"]', (tags) => {
      return tags.reduce((acc, tag) => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          acc[property] = content;
        }
        return acc;
      }, {} as Record<string, string>);
    }).catch(() => ({}));
    
    result.metadata.ogTags = ogTags;
    
    // Schema.org data
    const schemas = await page.$$eval('script[type="application/ld+json"]', (elements) => {
      return elements.map(el => {
        try {
          return JSON.parse(el.textContent || '{}');
        } catch (e) {
          return {};
        }
      });
    }).catch(() => []);
    
    result.metadata.schema = schemas;

    // Analyze content
    // Heading structure
    const headingStructure = await page.evaluate(() => {
      const h1Count = document.querySelectorAll('h1').length;
      const h2Count = document.querySelectorAll('h2').length;
      const h3Count = document.querySelectorAll('h3').length;
      const h4Count = document.querySelectorAll('h4').length;
      const h5Count = document.querySelectorAll('h5').length;
      const h6Count = document.querySelectorAll('h6').length;
      
      // Check if heading order is proper (no skipping levels)
      const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(h => parseInt(h.tagName.substring(1), 10));
        
      let hasProperOrder = true;
      let previousLevel = 0;
      
      for (const level of allHeadings) {
        if (previousLevel === 0) {
          // First heading should be H1
          if (level !== 1) {
            hasProperOrder = false;
          }
        } else if (level > previousLevel && level - previousLevel > 1) {
          // Skipped a level (e.g., H1 to H3)
          hasProperOrder = false;
        }
        previousLevel = level;
      }
      
      return {
        h1Count,
        h2Count,
        h3Count,
        otherHeadingsCount: h4Count + h5Count + h6Count,
        hasProperHeadingOrder: hasProperOrder
      };
    });
    
    result.content.headingStructure = headingStructure;
    
    // Word count
    result.content.wordCount = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.split(/\s+/).filter(word => word.length > 0).length;
    });
    
    // Paragraph count
    result.content.paragraphCount = await page.evaluate(() => {
      return document.querySelectorAll('p').length;
    });
    
    // Link analysis
    const linkAnalysis = await page.evaluate((currentUrl) => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const currentHostname = new URL(currentUrl).hostname;
      
      let internalCount = 0;
      let externalCount = 0;
      
      links.forEach(link => {
        try {
          const href = link.getAttribute('href') || '';
          
          // Skip empty, javascript:, and # links
          if (!href || href.startsWith('javascript:') || href === '#') {
            return;
          }
          
          // Handle relative URLs
          let url;
          if (href.startsWith('http')) {
            url = new URL(href);
          } else {
            url = new URL(href, currentUrl);
          }
          
          if (url.hostname === currentHostname) {
            internalCount++;
          } else {
            externalCount++;
          }
        } catch (e) {
          // Invalid URL
        }
      });
      
      return { internal: internalCount, external: externalCount };
    }, normalizedUrl);
    
    result.content.linkCount = linkAnalysis;
    
    // Image analysis
    const imageAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      
      let withAlt = 0;
      let withoutAlt = 0;
      
      images.forEach(img => {
        if (img.getAttribute('alt')?.trim()) {
          withAlt++;
        } else {
          withoutAlt++;
        }
      });
      
      return {
        count: images.length,
        withAlt,
        withoutAlt
      };
    });
    
    result.content.images = imageAnalysis;
    
    // Check mobile-friendliness
    // First, check if the page renders in mobile viewport
    const mobileRendered = await page.evaluate(() => {
      // Check if any fixed elements overlap viewport significantly
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if page width exceeds viewport
      const bodyWidth = document.body.scrollWidth;
      const rendersProperly = bodyWidth <= viewportWidth * 1.1; // Allow slight overflow
      
      // Check if meta viewport tag is present
      const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');
      
      return {
        renders: rendersProperly,
        hasViewportMeta
      };
    });
    
    result.technical.mobileViewport = {
      renders: mobileRendered.renders,
      responsive: mobileRendered.hasViewportMeta
    };

    // Calculate scores
    // SEO score (based on metadata)
    let seoScore = 0;
    
    // Title (20 points)
    if (result.metadata.title) {
      const titleLength = result.metadata.title.length;
      if (titleLength >= 30 && titleLength <= 60) {
        seoScore += 20; // Ideal title length
      } else if (titleLength > 0) {
        seoScore += 10; // Has title but not ideal length
      }
    }
    
    // Description (20 points)
    if (result.metadata.description) {
      const descLength = result.metadata.description.length;
      if (descLength >= 120 && descLength <= 160) {
        seoScore += 20; // Ideal description length
      } else if (descLength > 0) {
        seoScore += 10; // Has description but not ideal length
      }
    }
    
    // Canonical (10 points)
    if (result.metadata.canonical) {
      seoScore += 10;
    }
    
    // OG tags (10 points)
    if (Object.keys(result.metadata.ogTags).length >= 3) {
      seoScore += 10;
    } else if (Object.keys(result.metadata.ogTags).length > 0) {
      seoScore += 5;
    }
    
    // Schema markup (10 points)
    if (result.metadata.schema.length > 0) {
      seoScore += 10;
    }
    
    // H1 usage (10 points)
    if (result.content.headingStructure.h1Count === 1) {
      seoScore += 10; // Exactly one H1 is ideal
    } else if (result.content.headingStructure.h1Count > 1) {
      seoScore += 5; // Multiple H1s is not ideal but better than none
    }
    
    // Content score
    let contentScore = 0;
    
    // Word count (20 points)
    if (result.content.wordCount >= 600) {
      contentScore += 20; // Good content length
    } else if (result.content.wordCount >= 300) {
      contentScore += 10; // Minimal content length
    }
    
    // Heading structure (20 points)
    if (result.content.headingStructure.hasProperHeadingOrder && 
        result.content.headingStructure.h2Count > 0) {
      contentScore += 20; // Good heading structure
    } else if (result.content.headingStructure.h2Count > 0) {
      contentScore += 10; // Has subheadings but not ideal structure
    }
    
    // Paragraphs (10 points)
    if (result.content.paragraphCount >= 5) {
      contentScore += 10;
    } else if (result.content.paragraphCount > 0) {
      contentScore += 5;
    }
    
    // Links (20 points)
    if (result.content.linkCount.internal > 0 && result.content.linkCount.external > 0) {
      contentScore += 20; // Has both internal and external links
    } else if (result.content.linkCount.internal > 0 || result.content.linkCount.external > 0) {
      contentScore += 10; // Has some links
    }
    
    // Images with alt text (10 points)
    if (result.content.images.count > 0) {
      const altTextPercentage = result.content.images.withAlt / result.content.images.count;
      if (altTextPercentage >= 0.8) {
        contentScore += 20; // At least 80% of images have alt text
      } else if (altTextPercentage > 0) {
        contentScore += 10; // Some images have alt text
      }
    }
    
    // Technical score (URL-based + load time + mobile)
    let technicalScore = 0;
    
    // HTTPS (15 points)
    if (result.technical.httpsProtocol) {
      technicalScore += 15;
    }
    
    // Domain structure (5 points)
    if (result.technical.domainStructure === 'WWW Subdomain' || 
        result.technical.domainStructure === 'Root Domain') {
      technicalScore += 5;
    }
    
    // Path depth (5 points)
    if (result.technical.pathDepth <= 3) {
      technicalScore += 5;
    }
    
    // Load time (20 points)
    if (result.technical.loadTime < 1000) {
      technicalScore += 25; // Under 1 second is excellent
    } else if (result.technical.loadTime < 2000) {
      technicalScore += 20; // Under 2 seconds is very good
    } else if (result.technical.loadTime < 3000) {
      technicalScore += 15; // Under 3 seconds is good
    } else if (result.technical.loadTime < 5000) {
      technicalScore += 10; // Under 5 seconds is acceptable
    } else if (result.technical.loadTime < 8000) {
      technicalScore += 5; // Under 8 seconds is poor
    }
    
    // Status code (15 points)
    if (result.technical.statusCode === 200) {
      technicalScore += 15;
    }
    
    // Mobile viewport (15 points)
    if (result.technical.mobileViewport.renders && result.technical.mobileViewport.responsive) {
      technicalScore += 15;
    } else if (result.technical.mobileViewport.responsive) {
      technicalScore += 10;
    } else if (result.technical.mobileViewport.renders) {
      technicalScore += 5;
    }
    
    // Calculate accessibility score (basic checks)
    let accessibilityScore = 50; // Base score
    
    // Alt text for images (20 points)
    if (result.content.images.count > 0) {
      const altTextPercentage = result.content.images.withAlt / result.content.images.count;
      if (altTextPercentage === 1) {
        accessibilityScore += 20; // All images have alt text
      } else if (altTextPercentage >= 0.8) {
        accessibilityScore += 15; // Most images have alt text
      } else if (altTextPercentage >= 0.5) {
        accessibilityScore += 10; // Half of images have alt text
      } else if (altTextPercentage > 0) {
        accessibilityScore += 5; // Some images have alt text
      }
    }
    
    // Check for color contrast (15 points) - basic check for dark text on light background
    const hasGoodContrast = await page.evaluate(() => {
      // Simple check - we'd need more advanced tools for proper contrast checking
      const bodyStyle = window.getComputedStyle(document.body);
      const backgroundColor = bodyStyle.backgroundColor;
      
      // Parse RGB values
      const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!rgbMatch) return false;
      
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      
      // Calculate luminance (simplified)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Check if we have light background (luminance > 0.5) and dark text
      if (luminance > 0.5) {
        // Check if text is dark
        const paragraphs = document.querySelectorAll('p');
        const paragraphsArray = Array.from(paragraphs);
        
        for (const p of paragraphsArray) {
          const style = window.getComputedStyle(p);
          const color = style.color;
          const textRgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          
          if (textRgbMatch) {
            const tr = parseInt(textRgbMatch[1], 10);
            const tg = parseInt(textRgbMatch[2], 10);
            const tb = parseInt(textRgbMatch[3], 10);
            
            const textLuminance = (0.299 * tr + 0.587 * tg + 0.114 * tb) / 255;
            
            if (textLuminance < 0.4) {
              return true; // Found dark text on light background
            }
          }
        }
      }
      
      return false;
    });
    
    if (hasGoodContrast) {
      accessibilityScore += 15;
    }
    
    // Check for proper heading structure (15 points)
    if (result.content.headingStructure.hasProperHeadingOrder) {
      accessibilityScore += 15;
    }
    
    // Assign scores
    result.scores.seo = Math.min(100, seoScore);
    result.scores.performance = Math.min(100, technicalScore);
    result.scores.bestPractices = Math.min(100, contentScore);
    result.scores.accessibility = Math.min(100, accessibilityScore);
    
    // Overall score
    result.scores.overall = Math.round(
      (result.scores.seo * 0.3) +
      (result.scores.performance * 0.3) +
      (result.scores.accessibility * 0.2) +
      (result.scores.bestPractices * 0.2)
    );
    
    // Generate recommendations based on the analysis
    const recommendations: string[] = [];
    
    // SEO recommendations
    if (!result.metadata.title || result.metadata.title.length < 30 || result.metadata.title.length > 60) {
      recommendations.push(`Optimize your title tag. Ideal length is 30-60 characters. Current: ${result.metadata.title ? result.metadata.title.length : 0} characters.`);
    }
    
    if (!result.metadata.description || result.metadata.description.length < 120 || result.metadata.description.length > 160) {
      recommendations.push(`Improve your meta description. Ideal length is 120-160 characters. Current: ${result.metadata.description ? result.metadata.description.length : 0} characters.`);
    }
    
    if (!result.metadata.canonical) {
      recommendations.push('Add a canonical URL tag to prevent duplicate content issues.');
    }
    
    if (Object.keys(result.metadata.ogTags).length < 3) {
      recommendations.push('Add Open Graph meta tags to improve social media sharing.');
    }
    
    if (result.content.headingStructure.h1Count === 0) {
      recommendations.push('Add an H1 heading to your page.');
    } else if (result.content.headingStructure.h1Count > 1) {
      recommendations.push(`Use only one H1 heading per page. Current: ${result.content.headingStructure.h1Count}.`);
    }
    
    if (!result.content.headingStructure.hasProperHeadingOrder) {
      recommendations.push('Fix your heading structure. Use headings in the proper order (H1, then H2, then H3, etc.).');
    }
    
    if (result.content.wordCount < 300) {
      recommendations.push(`Add more content to your page. Current word count: ${result.content.wordCount}.`);
    }
    
    if (result.content.images.withoutAlt > 0) {
      recommendations.push(`Add alt text to all images. Missing alt text on ${result.content.images.withoutAlt} images.`);
    }
    
    if (result.content.linkCount.internal === 0) {
      recommendations.push('Add internal links to other pages on your site.');
    }
    
    if (result.content.linkCount.external === 0) {
      recommendations.push('Add external links to authoritative sources to improve credibility.');
    }
    
    if (!result.technical.httpsProtocol) {
      recommendations.push('Implement HTTPS to secure your website and improve search rankings.');
    }
    
    if (result.technical.loadTime > 3000) {
      recommendations.push(`Improve page load speed. Current load time: ${(result.technical.loadTime / 1000).toFixed(2)} seconds.`);
    }
    
    if (!result.technical.mobileViewport.responsive) {
      recommendations.push('Add a proper viewport meta tag for better mobile responsiveness.');
    }
    
    if (!result.technical.mobileViewport.renders) {
      recommendations.push('Fix mobile viewport rendering issues. Your page does not display properly on mobile devices.');
    }
    
    result.recommendations = recommendations;
    
    // Close browser
    await browser.close();
    
    return result;
  } catch (error) {
    console.error('Error during SEO analysis:', error);
    result.errors.push(`Analysis error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
} 