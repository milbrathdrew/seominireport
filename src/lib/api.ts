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
    const response = await fetch('/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate report');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 