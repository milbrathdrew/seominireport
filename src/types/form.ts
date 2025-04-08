import * as z from 'zod';
import { SeoAnalysisResult } from '@/lib/client-seo-analyzer';

export const formSchema = z.object({
  url: z.string()
    .url('Please enter a valid URL')
    .startsWith('http', 'URL must start with http:// or https://'),
  email: z.string()
    .email('Please enter a valid email address'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  useServerAnalysis: z.boolean().optional().default(true)
});

export type FormValues = z.infer<typeof formSchema>;

export type FormState = {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isError: boolean;
  errorMessage?: string;
};

export type SeoRecommendation = {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
};

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
  actionableItems?: SeoRecommendation[];
  priorityFixes?: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
  }>;
}; 