import { z } from 'zod';

// URL validation schema for form
export const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(5, 'URL is too short')
});

// Email validation schema for lead information
export const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  url: z.string().url('Please enter a valid URL')
});

// Combined schema for the SEO form
export const seoFormSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(5, 'URL is too short'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  useServerAnalysis: z.boolean().optional().default(false)
});

export type ReportData = {
  url: string;
  date: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  recommendations: string[];
  analysisError?: string;
  analysisDetails?: {
    technical: {
      httpsProtocol: boolean;
      domainHasWww: boolean;
      domainStructure: string;
      pathDepth: number;
      hasQueryParams: boolean;
      hasFragment: boolean;
      loadTime?: number;
      statusCode?: number;
      mobileViewport?: {
        renders: boolean;
        responsive: boolean;
      };
      [key: string]: any;
    };
    overallScore: number;
    metadata?: {
      title: string;
      description: string;
      canonical: string | null;
      ogTags: Record<string, string>;
      schema: any[];
    };
    content?: {
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
  };
}; 