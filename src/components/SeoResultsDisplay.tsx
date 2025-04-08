import React from 'react';
import { ReportData } from '@/types/form';
import ScoreExplanation from './ScoreExplanation';

interface ScoreCardProps {
  label: string;
  score: number;
  description?: string;
}

type SeoResultsDisplayProps = {
  report: ReportData;
};

// Helper function to determine score color
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-green-400';
  if (score >= 50) return 'bg-yellow-400';
  if (score >= 30) return 'bg-orange-400';
  return 'bg-red-400';
};

// Helper function to determine text color based on background
const getScoreTextColor = (score: number): string => {
  if (score >= 70) return 'text-white';
  if (score >= 30) return 'text-gray-800';
  return 'text-white';
};

// Helper to get score description
const getScoreDescription = (category: string, score: number): string => {
  if (category === 'SEO') {
    if (score >= 90) return 'Excellent on-page SEO optimization';
    if (score >= 70) return 'Good SEO fundamentals in place';
    if (score >= 50) return 'Basic SEO present, needs improvement';
    return 'Poor SEO, requires immediate attention';
  }
  
  if (category === 'Performance') {
    if (score >= 90) return 'Excellent page speed and technical setup';
    if (score >= 70) return 'Good performance, some optimizations needed';
    if (score >= 50) return 'Average performance, several issues to fix';
    return 'Poor performance, requires significant work';
  }
  
  if (category === 'Accessibility') {
    if (score >= 90) return 'Highly accessible to all users';
    if (score >= 70) return 'Good accessibility practices in place';
    if (score >= 50) return 'Basic accessibility, needs improvement';
    return 'Poor accessibility, requires significant work';
  }
  
  // Best Practices
  if (score >= 90) return 'Follows all web best practices';
  if (score >= 70) return 'Good adherence to best practices';
  if (score >= 50) return 'Average implementation of best practices';
  return 'Poor implementation, needs significant improvement';
};

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, description }) => {
  const scoreDescription = description || getScoreDescription(label, score);
  
  return (
    <div className={`rounded-lg p-4 ${getScoreColor(score)} ${getScoreTextColor(score)}`}>
      <h3 className="text-sm font-medium uppercase opacity-90">
        {label}
      </h3>
      <p className="text-3xl font-bold mt-1">{score}</p>
      <p className="mt-2 text-sm opacity-90">{scoreDescription}</p>
    </div>
  );
};

const SeoResultsDisplay: React.FC<SeoResultsDisplayProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ScoreCard 
          label="SEO Score" 
          score={report.scores.seo} 
        />
        <ScoreCard 
          label="Performance" 
          score={report.scores.performance} 
        />
        <ScoreCard 
          label="Accessibility" 
          score={report.scores.accessibility} 
        />
        <ScoreCard 
          label="Best Practices" 
          score={report.scores.bestPractices} 
        />
      </div>

      {/* Add Score Explanation with Learn More CTA */}
      <div className="mb-8">
        <ScoreExplanation />
      </div>
      
      {/* Technical Analysis Section */}
      {report.analysisDetails?.technical && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className={`w-3 h-3 rounded-full mr-3 ${report.analysisDetails.technical.httpsProtocol ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div>
                <p className="font-medium">HTTPS Protocol</p>
                <p className="text-sm text-gray-600">
                  {report.analysisDetails.technical.httpsProtocol ? 'Secure connection (HTTPS) implemented' : 'Not using secure connection (HTTPS)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-3 h-3 rounded-full mr-3 bg-blue-400"></div>
              <div>
                <p className="font-medium">Domain Structure</p>
                <p className="text-sm text-gray-600">
                  {report.analysisDetails.technical.domainHasWww ? 'Using www subdomain' : 'Not using www subdomain'} 
                  <span className="block text-xs">{report.analysisDetails.technical.domainStructure}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className={`w-3 h-3 rounded-full mr-3 ${report.analysisDetails.technical.pathDepth <= 3 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <div>
                <p className="font-medium">URL Structure</p>
                <p className="text-sm text-gray-600">
                  Path depth: {report.analysisDetails.technical.pathDepth} level(s)
                  {report.analysisDetails.technical.pathDepth > 3 && 
                    <span className="block text-xs text-yellow-600">Deep URL paths can impact SEO</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className={`w-3 h-3 rounded-full mr-3 ${!report.analysisDetails.technical.hasQueryParams ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <div>
                <p className="font-medium">URL Parameters</p>
                <p className="text-sm text-gray-600">
                  {report.analysisDetails.technical.hasQueryParams ? 'Contains query parameters' : 'Clean URL without parameters'}
                </p>
              </div>
            </div>
            
            {/* Additional technical details if available */}
            {report.analysisDetails.technical.loadTime !== undefined && (
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  report.analysisDetails.technical.loadTime < 3000 ? 'bg-green-400' : 
                  report.analysisDetails.technical.loadTime < 5000 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <p className="font-medium">Load Time</p>
                  <p className="text-sm text-gray-600">
                    {(report.analysisDetails.technical.loadTime / 1000).toFixed(2)} seconds
                  </p>
                </div>
              </div>
            )}
            
            {report.analysisDetails.technical.mobileViewport && (
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  report.analysisDetails.technical.mobileViewport.responsive ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                <div>
                  <p className="font-medium">Mobile Friendly</p>
                  <p className="text-sm text-gray-600">
                    {report.analysisDetails.technical.mobileViewport.responsive 
                      ? 'Properly configured for mobile devices' 
                      : 'Not properly configured for mobile devices'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Recommendations</h3>
        <ul className="space-y-3">
          {report.recommendations.map((recommendation, index) => (
            <li key={index} className="bg-gray-50 p-3 rounded-md">
              <div className="flex">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mr-3">
                  {index + 1}
                </div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SeoResultsDisplay; 