import { FormValues, ReportData } from "@/types/form";

/**
 * Generate SEO report for the specified URL
 */
export async function generateReport(data: FormValues): Promise<{
  success: boolean;
  message: string;
  reportId?: string;
  report?: ReportData;
  error?: string;
}> {
  try {
    // First attempt to use the full endpoint that stores data
    let response = await fetch('/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // If there's a database error, fall back to the analyze-only endpoint
    if (!response.ok && response.status === 500) {
      console.warn('Database storage failed, falling back to analysis-only mode');
      
      response = await fetch('/api/analyze-only', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate report');
    }

    // Pass through the error field if it exists (for analysis errors)
    return {
      ...result,
      success: result.success || false,
      message: result.message || '',
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 