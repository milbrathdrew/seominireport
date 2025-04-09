'use client';

import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Setup Guide',
  description: 'Instructions for setting up SEO reports',
};

export default function SetupGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">SEO Reports Setup Guide</h1>
      
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Action Items Feature Removed</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p>
              The Action Items feature has been removed from this application. 
              You no longer need to set up the <code>action_items</code> table in your database.
            </p>
            
            <p>
              SEO reports will continue to function normally, providing recommendations 
              without the additional "actionable items" functionality.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Current System Setup</h2>
        </div>
        <div className="p-6">
          <p className="mb-4">
            The SEO reporting system uses the following database tables:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><code>leads</code> - Stores information about users who requested reports</li>
            <li><code>reports</code> - Stores the SEO analysis results and recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 