import React, { useState } from 'react';
import { SeoRecommendation } from '@/types/form';

type ActionableItemsProps = {
  items: SeoRecommendation[];
};

const ActionableItems: React.FC<ActionableItemsProps> = ({ items }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');

  // Group items by category
  const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
  const categories = ['all', ...uniqueCategories];
  
  // Filter items based on active category
  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.category === activeFilter);
  
  // Sort items based on the selected sorting option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    } else if (sortBy === 'effort') {
      const effortValues = { low: 3, medium: 2, high: 1 }; // Reverse for effort (low effort = higher rank)
      return effortValues[a.effort] - effortValues[b.effort];
    } else if (sortBy === 'impact') {
      const impactValues = { high: 3, medium: 2, low: 1 };
      return impactValues[b.impact] - impactValues[a.impact];
    }
    return 0;
  });

  // Helper function to get color classes based on priority/effort/impact
  const getColorClass = (value: 'high' | 'medium' | 'low', type: 'priority' | 'effort' | 'impact') => {
    if (type === 'priority' || type === 'impact') {
      if (value === 'high') return 'bg-red-100 text-red-800';
      if (value === 'medium') return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    } else { // effort - inverse color scheme
      if (value === 'high') return 'bg-red-100 text-red-800';
      if (value === 'medium') return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Actionable SEO Recommendations
        </h2>
        <p className="text-gray-600">
          These recommendations are organized by priority and effort to help you implement improvements effectively.
        </p>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by category:</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="priority">Priority (Highest first)</option>
            <option value="effort">Effort (Easiest first)</option>
            <option value="impact">Impact (Highest first)</option>
          </select>
        </div>
      </div>

      {/* Action items list */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No items found for the selected category.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass(item.priority, 'priority')}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 mb-4">{item.description}</p>
                
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Category:</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Effort:</span>
                    <span className={`px-2 py-0.5 rounded ${getColorClass(item.effort, 'effort')}`}>
                      {item.effort.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Impact:</span>
                    <span className={`px-2 py-0.5 rounded ${getColorClass(item.impact, 'impact')}`}>
                      {item.impact.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Quick summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Implementation Plan</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Quick Wins (High Impact, Low Effort)</h4>
          <ul className="list-disc list-inside ml-2 space-y-1 text-gray-700">
            {sortedItems
              .filter(item => item.impact === 'high' && item.effort === 'low')
              .slice(0, 3)
              .map((item, index) => (
                <li key={index}>{item.title}</li>
              ))}
            {sortedItems.filter(item => item.impact === 'high' && item.effort === 'low').length === 0 && (
              <li className="text-gray-500">No quick wins identified</li>
            )}
          </ul>
          
          <h4 className="font-medium text-gray-800 mt-4 mb-2">Strategic Improvements (High Impact, Medium-High Effort)</h4>
          <ul className="list-disc list-inside ml-2 space-y-1 text-gray-700">
            {sortedItems
              .filter(item => item.impact === 'high' && (item.effort === 'medium' || item.effort === 'high'))
              .slice(0, 3)
              .map((item, index) => (
                <li key={index}>{item.title}</li>
              ))}
            {sortedItems.filter(item => item.impact === 'high' && (item.effort === 'medium' || item.effort === 'high')).length === 0 && (
              <li className="text-gray-500">No strategic improvements identified</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActionableItems; 