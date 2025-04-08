import React from 'react';
import { ReportData } from '@/types/form';

interface ScoreCardProps {
  label: string;
  score: number;
  description?: string;
}

interface SeoResultsDisplayProps {
  report: ReportData;
}

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-green-400';
  if (score >= 50) return 'bg-yellow-400';
  if (score >= 30) return 'bg-orange-400';
  return 'bg-red-500';
};

// Helper function to get text color based on score
const getScoreTextColor = (score: number): string => {
  if (score >= 50) return 'text-white';
  return 'text-gray-900';
};

// Score Card Component
const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, description }) => (
  <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
    <div className="flex items-center mb-2">
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${getScoreColor(score)} ${getScoreTextColor(score)}`}
      >
        {score}
      </div>
      <div className="ml-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getScoreColor(score)}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{score >= 70 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Poor'}</p>
      </div>
    </div>
    {description && <p className="text-sm text-gray-600">{description}</p>}
  </div>
);

// Main SEO Results Component
const SeoResultsDisplay: React.FC<SeoResultsDisplayProps> = ({ report }) => {
  // Get score descriptions
  const getScoreDescription = (type: string, score: number): string => {
    switch (type) {
      case 'seo':
        return score >= 70 
          ? 'Your SEO fundamentals are strong.' 
          : 'Your SEO needs improvement.';
      case 'performance':
        return score >= 70 
          ? 'Your site has good technical performance.' 
          : 'Technical improvements needed.';
      case 'accessibility':
        return score >= 70 
          ? 'Your site has good accessibility.' 
          : 'Accessibility needs improvement.';
      case 'bestPractices':
        return score >= 70 
          ? 'Your site follows best practices.' 
          : 'Consider implementing best practices.';
      default:
        return '';
    }
  };

  return (
    <div className="mt-8 w-full">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">SEO Analysis Results</h2>
        <div className="text-gray-600 mb-4">
          <span className="font-medium">URL:</span> {report.url}
        </div>
        
        {report.analysisDetails?.overallScore && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Score</h3>
            <div className="flex items-center">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${getScoreColor(report.analysisDetails.overallScore)} ${getScoreTextColor(report.analysisDetails.overallScore)}`}
              >
                {report.analysisDetails.overallScore}
              </div>
              <div className="ml-6">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${getScoreColor(report.analysisDetails.overallScore)}`} 
                    style={{ width: `${report.analysisDetails.overallScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {report.analysisDetails.overallScore >= 80 
                    ? 'Excellent! Your site has strong SEO fundamentals.' 
                    : report.analysisDetails.overallScore >= 60 
                    ? 'Good. Your site has decent SEO but could be improved.' 
                    : 'Needs work. We recommend implementing the suggestions below.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Score Breakdown */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard 
            label="SEO Score" 
            score={report.scores.seo} 
            description={getScoreDescription('seo', report.scores.seo)}
          />
          <ScoreCard 
            label="Performance" 
            score={report.scores.performance} 
            description={getScoreDescription('performance', report.scores.performance)}
          />
          <ScoreCard 
            label="Accessibility" 
            score={report.scores.accessibility} 
            description={getScoreDescription('accessibility', report.scores.accessibility)}
          />
          <ScoreCard 
            label="Best Practices" 
            score={report.scores.bestPractices} 
            description={getScoreDescription('bestPractices', report.scores.bestPractices)}
          />
        </div>
      </div>
      
      {/* Technical Analysis */}
      {report.analysisDetails?.technical && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">HTTPS Protocol</p>
              <div className="flex items-center mt-2">
                <div className={`w-6 h-6 rounded-full ${report.analysisDetails.technical.httpsProtocol ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                  <span className="text-white text-xs">{report.analysisDetails.technical.httpsProtocol ? '✓' : '✗'}</span>
                </div>
                <p className="ml-2 text-sm text-gray-600">{report.analysisDetails.technical.httpsProtocol ? 'Secure (HTTPS)' : 'Not secure (HTTP)'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">Domain Structure</p>
              <p className="mt-2 text-sm text-gray-600">{report.analysisDetails.technical.domainStructure}</p>
              <p className="text-xs text-gray-500">{report.analysisDetails.technical.domainHasWww ? 'Includes www prefix' : 'No www prefix'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">URL Structure</p>
              <p className="mt-2 text-sm text-gray-600">Path Depth: {report.analysisDetails.technical.pathDepth}</p>
              <p className="text-xs text-gray-500">
                {report.analysisDetails.technical.pathDepth === 0 
                  ? 'Homepage (optimal for domain authority)' 
                  : report.analysisDetails.technical.pathDepth <= 2 
                  ? 'Good depth for important pages' 
                  : 'Deep page - consider flatter structure'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">URL Parameters</p>
              <div className="flex items-center mt-2">
                <div className={`w-6 h-6 rounded-full ${!report.analysisDetails.technical.hasQueryParams ? 'bg-green-500' : 'bg-yellow-400'} flex items-center justify-center`}>
                  <span className="text-white text-xs">{!report.analysisDetails.technical.hasQueryParams ? '✓' : '!'}</span>
                </div>
                <p className="ml-2 text-sm text-gray-600">
                  {report.analysisDetails.technical.hasQueryParams 
                    ? 'Uses query parameters (may affect SEO)' 
                    : 'Clean URL (good for SEO)'}
                </p>
              </div>
              {report.analysisDetails.technical.hasFragment && (
                <p className="text-xs text-gray-500 mt-1">Contains URL fragment (#)</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h3>
        <ul className="space-y-3">
          {report.recommendations.map((recommendation, index) => (
            <li key={index} className="flex">
              <span className="inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mr-2 text-white bg-blue-500 rounded-full">
                <span className="text-xs font-bold">{index + 1}</span>
              </span>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SeoResultsDisplay; 