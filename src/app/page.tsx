import React from 'react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
          Discover Your Website's SEO Potential
        </h1>
        <p className="text-xl text-white/90 mb-12">
          Get your free comprehensive SEO report in seconds. No login required.
        </p>
        
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl mx-auto">
          <form className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                name="url"
                id="url"
                required
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg shadow-lg hover:from-primary-700 hover:to-secondary-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Generate Your Free SEO Report Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 