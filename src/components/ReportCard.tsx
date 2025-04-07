import React from 'react';
import { ReportData } from '@/types/form';

interface ReportCardProps {
  report: ReportData;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { url, date, scores, recommendations } = report;
  const formattedDate = new Date(date).toLocaleDateString();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SEO Report Results</h2>
        <p className="text-gray-600">
          Analysis for <span className="font-medium text-primary-700">{url}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">Generated on {formattedDate}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <p className={`text-3xl font-bold mt-1 ${getScoreColor(value)}`}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          type="button"
          className="w-full px-4 py-3 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition"
        >
          Download Detailed Report (PDF)
        </button>
      </div>
    </div>
  );
};

export default ReportCard; 