import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mini SEO Report - Free SEO Analysis',
  description: 'Get a free SEO analysis of your website. Discover your website\'s SEO potential with our instant analysis tool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-primary-600 to-secondary-700">
          {children}
        </main>
      </body>
    </html>
  );
} 