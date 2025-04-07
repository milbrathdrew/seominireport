'use client';

import React from 'react';
import SeoForm from '@/components/SeoForm';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-fade-in">
          Discover Your Website's SEO Potential
        </h1>
        <p className="text-xl text-white/90 mb-12 animate-fade-in">
          Get your free comprehensive SEO report in seconds. No login required.
        </p>
        
        <SeoForm />
      </div>
    </div>
  );
} 