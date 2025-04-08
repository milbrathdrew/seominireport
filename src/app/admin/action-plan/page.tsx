import React from 'react';
import Link from 'next/link';
import { getReportWithActionItems } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ActionableItems from '@/components/ActionableItems';
import { SeoRecommendation } from '@/types/form';

// This would typically be fetched from a query parameter or context
const SAMPLE_REPORT_ID = '123456'; // Replace with an actual ID in production

export const metadata = {
  title: 'SEO Action Plan',
  description: 'Prioritized action plan to improve your SEO'
};

export default async function ActionPlanPage() {
  const reportWithItems = await getReportWithActionItems(SAMPLE_REPORT_ID);
  
  if (!reportWithItems) {
    notFound();
  }
  
  // Format date
  const reportDate = new Date(reportWithItems.created_at || '').toLocaleString();
  
  // Map action items to the format expected by ActionableItems component
  const actionItems: SeoRecommendation[] = reportWithItems.action_items.map(item => {
    // Convert number priority to string type
    let priorityLevel: 'high' | 'medium' | 'low';
    if (item.priority === 1) priorityLevel = 'high';
    else if (item.priority === 2) priorityLevel = 'medium';
    else priorityLevel = 'low';
    
    // Convert string effort and impact to proper enum types
    const effortLevel = item.effort_level === 'high' || item.effort_level === 'medium' || item.effort_level === 'low' 
      ? item.effort_level 
      : 'medium';
      
    const impactLevel = item.expected_impact === 'high' || item.expected_impact === 'medium' || item.expected_impact === 'low'
      ? item.expected_impact
      : 'medium';
    
    return {
      title: item.title,
      description: item.description,
      category: item.category,
      priority: priorityLevel,
      effort: effortLevel,
      impact: impactLevel
    };
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">SEO Action Plan</h1>
        <p className="text-gray-600 mb-6">
          Generated on {reportDate} for <a href={reportWithItems.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{reportWithItems.url}</a>
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">About This Action Plan</h2>
          <p className="text-blue-700 mb-2">
            This plan contains prioritized recommendations to improve your website's SEO performance. 
            Each item includes:
          </p>
          <ul className="list-disc list-inside text-blue-700 ml-2">
            <li>Priority level (High, Medium, Low)</li>
            <li>Effort required to implement</li>
            <li>Expected impact on your SEO</li>
            <li>Detailed explanation and instructions</li>
          </ul>
        </div>
        
        {actionItems.length > 0 ? (
          <ActionableItems items={actionItems} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium text-gray-700 mb-2">No action items available</h2>
            <p className="text-gray-500">
              We couldn't generate action items for this report. Please try analyzing the website again.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Implementation Timeline</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Phase 1: Quick Wins (1-2 weeks)</h3>
            <p className="text-gray-600 mb-2">Focus on implementing the high-priority, low-effort items first:</p>
            <ul className="list-disc list-inside text-gray-700 ml-4">
              {actionItems
                .filter(item => item.priority === 'high' && item.effort === 'low')
                .slice(0, 5)
                .map((item, index) => (
                  <li key={index} className="mb-1">{item.title}</li>
                ))}
              {actionItems.filter(item => item.priority === 'high' && item.effort === 'low').length === 0 && (
                <li className="text-gray-500">No quick wins identified</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Phase 2: Strategic Improvements (2-4 weeks)</h3>
            <p className="text-gray-600 mb-2">After implementing quick wins, tackle these high-impact items:</p>
            <ul className="list-disc list-inside text-gray-700 ml-4">
              {actionItems
                .filter(item => item.priority === 'high' && item.effort === 'medium')
                .slice(0, 5)
                .map((item, index) => (
                  <li key={index} className="mb-1">{item.title}</li>
                ))}
              {actionItems.filter(item => item.priority === 'high' && item.effort === 'medium').length === 0 && (
                <li className="text-gray-500">No strategic improvements identified</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Phase 3: Long-term Projects (1-3 months)</h3>
            <p className="text-gray-600 mb-2">These items require more effort but will provide lasting benefits:</p>
            <ul className="list-disc list-inside text-gray-700 ml-4">
              {actionItems
                .filter(item => item.priority === 'high' && item.effort === 'high')
                .slice(0, 5)
                .map((item, index) => (
                  <li key={index} className="mb-1">{item.title}</li>
                ))}
              {actionItems.filter(item => item.priority === 'high' && item.effort === 'high').length === 0 && (
                <li className="text-gray-500">No long-term projects identified</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 