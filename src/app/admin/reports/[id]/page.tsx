import { getReportById } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'SEO Report Details',
  description: 'Detailed view of an SEO report'
};

// This makes the page dynamic to avoid caching issues
export const dynamic = 'force-dynamic';

export default async function ReportPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const report = await getReportById(params.id);
  
  if (!report) {
    notFound();
  }
  
  // Format date
  const reportDate = new Date(report.created_at || '').toLocaleString();
  
  // Calculate average score
  const scores = report.scores;
  const avgScore = Math.round(
    (scores.performance + scores.accessibility + scores.seo + scores.bestPractices) / 4
  );
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">SEO Report</h1>
        <p className="text-gray-600 mb-6">
          Generated on {reportDate} for <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{report.url}</a>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white p-4 rounded-lg text-center col-span-1 lg:col-span-1">
            <div className="text-3xl font-bold">{avgScore}</div>
            <div>Overall Score</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold">{scores.seo}</div>
            <div>SEO Score</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold">{scores.performance}</div>
            <div>Performance</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold">{scores.accessibility}</div>
            <div>Accessibility</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold">{scores.bestPractices}</div>
            <div>Best Practices</div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="bg-white border rounded-lg">
            {report.recommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className={`p-4 ${index !== report.recommendations.length - 1 ? 'border-b' : ''}`}
              >
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>{recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Next Steps for This Client</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Schedule a follow-up call to discuss the SEO findings</li>
            <li>Prepare a detailed implementation plan for the top 3 recommendations</li>
            <li>Suggest a monthly SEO maintenance package based on site needs</li>
            <li>Offer specialized services for performance optimization</li>
            <li>Propose content strategy based on SEO gaps identified</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 