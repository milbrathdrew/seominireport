import React, { useState } from 'react';

type ScoreCategory = {
  name: string;
  description: string;
  metrics: Array<{
    name: string;
    points: string;
    description: string;
  }>;
};

const scoreCategories: ScoreCategory[] = [
  {
    name: 'SEO',
    description: 'Measures on-page SEO factors that impact search engine rankings',
    metrics: [
      { name: 'Title Tag', points: '20 points', description: 'Existence (10pts) and optimal length of 30-60 chars (10pts)' },
      { name: 'Meta Description', points: '20 points', description: 'Existence (10pts) and optimal length of 120-160 chars (10pts)' },
      { name: 'Heading Structure', points: '20 points', description: 'Single H1 present (10pts) and proper heading hierarchy (10pts)' },
      { name: 'Canonical URL', points: '10 points', description: 'Presence of canonical tag' },
      { name: 'Open Graph Tags', points: '10 points', description: 'Presence of 3+ OG tags (10pts) or partial implementation (5pts)' },
      { name: 'Schema Markup', points: '10 points', description: 'Any structured data present' },
      { name: 'URL Structure', points: '10 points', description: 'Clean format without excessive parameters' },
    ]
  },
  {
    name: 'Performance',
    description: 'Evaluates how quickly and efficiently your page loads',
    metrics: [
      { name: 'Load Time', points: '25 points', description: 'Under 1s (25pts), 2s (20pts), 3s (15pts), 5s (10pts), 8s (5pts)' },
      { name: 'HTTPS', points: '15 points', description: 'Secure protocol implementation' },
      { name: 'Response Status', points: '15 points', description: 'Clean 200 response without redirects' },
      { name: 'Mobile Viewport', points: '15 points', description: 'Viewport meta tag (10pts) and proper rendering (5pts)' },
      { name: 'Domain Structure', points: '5 points', description: 'WWW or non-WWW consistency' },
      { name: 'URL Complexity', points: '5 points', description: 'Path depth ≤ 3 levels' },
      { name: 'Technical Factors', points: '20 points', description: 'JS, image optimization, CSS minification' },
    ]
  },
  {
    name: 'Accessibility',
    description: 'Assesses how well your site works for users with disabilities',
    metrics: [
      { name: 'Base Score', points: '50 points', description: 'Starting point acknowledging limited automatic testing' },
      { name: 'Image Alt Text', points: '20 points', description: 'All images (20pts), 80%+ (15pts), 50%+ (10pts), some (5pts)' },
      { name: 'Color Contrast', points: '15 points', description: 'Basic test for dark text on light background' },
      { name: 'Heading Structure', points: '15 points', description: 'Proper heading hierarchy without skipped levels' },
    ]
  },
  {
    name: 'Best Practices',
    description: 'Evaluates content quality and user experience standards',
    metrics: [
      { name: 'Content Length', points: '20 points', description: '600+ words (20pts), 300+ words (10pts)' },
      { name: 'Heading Structure', points: '20 points', description: 'Proper structure with H2s (20pts), some subheadings (10pts)' },
      { name: 'Paragraph Structure', points: '10 points', description: '5+ paragraphs (10pts), some paragraphs (5pts)' },
      { name: 'Link Strategy', points: '20 points', description: 'Both internal and external links (20pts), some links (10pts)' },
      { name: 'Image Usage', points: '20 points', description: 'Images with proper alt text (20pts), some alt text (10pts)' },
      { name: 'Content Formatting', points: '10 points', description: 'Lists, spacing, and formatting' },
    ]
  }
];

export default function ScoreExplanation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const toggleCategory = (name: string) => {
    setActiveCategory(activeCategory === name ? null : name);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the subscription
    alert(`Thank you for subscribing with ${email}! We'll send you our SEO scoring guide.`);
    setEmail('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">How We Calculate Your SEO Scores</h2>
        <p className="text-gray-600 mt-2">
          Our comprehensive analysis evaluates 4 key categories using advanced web crawling technology
        </p>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreCategories.map((category) => (
            <div 
              key={category.name} 
              className="cursor-pointer"
              onClick={() => toggleCategory(category.name)}
            >
              <div className={`rounded-lg p-4 transition-all ${
                activeCategory === category.name 
                  ? 'bg-primary-50 border-2 border-primary-500' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}>
                <h3 className="font-medium text-lg text-gray-900 flex justify-between items-center">
                  {category.name}
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    100 pts
                  </span>
                </h3>
                <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                
                {activeCategory === category.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Scoring Metrics:</h4>
                    <ul className="space-y-2 text-sm">
                      {category.metrics.map((metric) => (
                        <li key={metric.name} className="flex justify-between">
                          <span className="text-gray-700">{metric.name}</span>
                          <span className="text-gray-500 font-medium">{metric.points}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
                        Click on any metric to see detailed scoring criteria
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-lg p-6 border border-primary-100">
        <div className="md:flex justify-between items-center">
          <div className="md:w-2/3">
            <h3 className="text-lg font-bold text-primary-900">
              Want a detailed breakdown of our scoring methodology?
            </h3>
            <p className="mt-2 text-gray-700">
              Get our comprehensive SEO scoring guide delivered to your inbox. Learn exactly how we evaluate your website and get tips to improve your scores.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 md:w-1/3">
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Get Free SEO Scoring Guide
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Our scoring system is continuously improved based on the latest SEO best practices.
          <br />
          Last updated: April 2025
        </p>
      </div>
    </div>
  );
} 