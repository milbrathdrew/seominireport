# Project Brief: Minimalist SEO Report Generator

## Core Concept
A single-page SEO report generator where users enter their website URL, email, and name to receive a free SEO analysis. No login required, no complex dashboards - just instant value delivery.

## Key Features

1. **Modern Landing Page**
   - Clean, visually appealing "lush" design
   - Simple form with 3 fields: Website URL, Email, Name
   - Clear CTA button: "Generate your free SEO report now"
   - Minimal explanatory text highlighting benefits

2. **Instant SEO Analysis**
   - Run quick technical analysis when user submits form
   - Show loading/processing indicator
   - Generate PDF report or display results directly on page

3. **Core SEO Analysis Components**
   - Lighthouse performance scores (Performance, SEO, Accessibility)
   - Basic meta tag analysis (title, description, headings)
   - Mobile-friendliness check
   - Page speed metrics
   - Simple content overview (word count, readability)

4. **Lead Capture**
   - Store submitted information in database
   - Send confirmation email with report attached or link to view

## Technical Implementation Overview

### Frontend
- Single responsive page using Next.js
- Tailwind CSS with subtle animations
- Form validation and submission handling
- Visual loading states during report generation

### Backend
- Serverless function to process report requests
- Lighthouse API integration for core metrics
- Simple crawler to extract basic on-page elements
- PDF generation using React-PDF or similar
- Email delivery via SendGrid/Mailgun/etc.

### Infrastructure
- Vercel for hosting frontend and serverless functions
- Supabase for minimal database needs (storing leads and reports)
- No authentication system required

## Project Goals
- Provide instant value to users through quick SEO analysis
- Capture leads for potential follow-up services
- Demonstrate technical expertise in SEO
- Create a streamlined, frictionless user experience 