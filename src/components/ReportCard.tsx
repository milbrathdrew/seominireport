import React, { useState } from 'react';
import { ReportData } from '@/types/form';
import SeoResultsDisplay from './SeoResultsDisplay';

type ReportCardProps = {
  report: ReportData;
  error?: string;
};

const ReportCard: React.FC<ReportCardProps> = ({ report, error }) => {
  const [showDetailed, setShowDetailed] = useState(false);
  const { url, date } = report;
  const formattedDate = new Date(date).toLocaleDateString();

  // Check if this is a fallback report (all scores are 50)
  const isFallbackReport = 
    report.scores.performance === 50 && 
    report.scores.accessibility === 50 && 
    report.scores.seo === 50 && 
    report.scores.bestPractices === 50;

  // Simple summary view for initial display
  const SimpleSummary = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(report.scores).map(([key, value]) => {
          // Get color based on score
          let bgColor = 'bg-red-100 text-red-800';
          if (value >= 90) bgColor = 'bg-green-100 text-green-800';
          else if (value >= 70) bgColor = 'bg-green-50 text-green-700';
          else if (value >= 50) bgColor = 'bg-yellow-100 text-yellow-800';
          else if (value >= 30) bgColor = 'bg-orange-100 text-orange-800';
          
          return (
            <div key={key} className={`rounded-lg p-4 text-center ${bgColor}`}>
              <h3 className="text-sm font-medium uppercase opacity-90">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-3">Top Recommendations</h3>
        <ul className="space-y-2">
          {report.recommendations.slice(0, 5).map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SEO Report Results</h2>
        <p className="text-gray-600">
          Analysis for <span className="font-medium text-primary-700">{url}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">Generated on {formattedDate}</p>
        
        {isFallbackReport && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <p className="font-medium">Limited Analysis Available</p>
            <p className="mt-1">We couldn't fully analyze your website. The results below are estimates.</p>
            {error && <p className="mt-1 text-xs opacity-75">{error}</p>}
          </div>
        )}
      </div>

      {showDetailed ? (
        // Show the detailed analysis view
        <SeoResultsDisplay report={report} />
      ) : (
        // Show the simple summary view
        <SimpleSummary />
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
        <button 
          type="button"
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full sm:w-auto px-6 py-3 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-200 transition"
        >
          {showDetailed ? 'Show Simple Summary' : 'View Detailed Analysis'}
        </button>
      </div>
    </div>
  );
};

export default ReportCard; 