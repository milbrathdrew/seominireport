# Minimalist SEO Report Generator

A single-page SEO report generator that helps website owners understand their SEO performance. Users enter their website URL, email, and name to receive a free SEO analysis report.

## Features

- Modern, visually appealing landing page
- Simple form with just 3 fields
- URL-based SEO analysis with intelligent scoring
- Instant report generation
- Tailored recommendations based on URL patterns
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **Form Validation**: react-hook-form with zod
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd mini-seo-report
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Branch Structure

We follow a GitFlow-inspired branching strategy:

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: For new features
- `bugfix/*`: For bug fixes
- `hotfix/*`: For critical production fixes

See [branchingStrategy.md](./memory-bank/branchingStrategy.md) for detailed workflow.

### Directory Structure

- `/src/app`: Next.js app directory
- `/src/components`: React components
- `/src/lib`: Utility functions
- `/src/styles`: Global styles
- `/src/types`: TypeScript types
- `/memory-bank`: Project documentation

## Features Implemented

- Form validation with error messages
- Responsive UI with loading states
- URL-based SEO analysis
- Score calculation for performance, accessibility, SEO, and best practices
- Dynamic recommendations based on URL patterns
- Report display with visual score indicators

## Future Enhancements

- PDF report generation
- Email delivery of reports
- More sophisticated SEO analysis
- Dashboard for viewing past reports
- Premium report options

## Documentation

Project documentation is maintained in the `/memory-bank` directory:

- `projectbrief.md`: Core concept and features
- `productContext.md`: Why this project exists
- `systemPatterns.md`: Architecture and design patterns
- `techContext.md`: Technical details and constraints
- `activeContext.md`: Current development focus
- `progress.md`: Project status and roadmap

## License

[MIT](LICENSE) 