# Technical Context: Minimalist SEO Report Generator

## Technology Stack

### Frontend
- **Framework**: Next.js 14.1.0 (React 18.2.0)
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React hooks (useState, useContext)
- **Form Handling**: React Hook Form 7.51.0 with Zod validation
- **Animation**: CSS animations via Tailwind

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **SEO Analysis**: Google Lighthouse API (planned)
- **HTML Parsing**: Cheerio (planned)
- **PDF Generation**: React-PDF (planned)
- **Email Service**: SendGrid or Mailgun (planned)

### Database
- **Storage**: Supabase (PostgreSQL) (planned)
- **Tables**:
  - Leads (user information)
  - Reports (analysis results)

### Deployment
- **Hosting**: Vercel (planned)
- **CI/CD**: Vercel GitHub integration (planned)

## Development Environment

### Required Tools
- Node.js (v16+)
- npm 
- Git

### Local Setup
```bash
# Clone repository
git clone [repo-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Email Service
EMAIL_SERVICE_API_KEY=

# Deployment URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Technical Constraints

1. **Performance**
   - Lighthouse analysis can be resource-intensive
   - Report generation shouldn't exceed 30 seconds
   - API timeout limits on Vercel (10-second execution time)

2. **External APIs**
   - Rate limits on Lighthouse API
   - Email service delivery quotas
   - Need for error handling and fallbacks

3. **Security Considerations**
   - URL validation to prevent malicious inputs
   - Rate limiting to prevent abuse
   - Data handling compliance (GDPR)

4. **Browser Compatibility**
   - Support for modern browsers (last 2 versions)
   - Graceful degradation for older browsers

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.25",
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "postcss-import": "^16.0.1",
    "postcss-nesting": "^12.0.4",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.2"
  }
}
```

## CSS Configuration

### Tailwind CSS Setup
We're using a simplified Tailwind CSS configuration to avoid compatibility issues:

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { /* color values */ },
        secondary: { /* color values */ },
      },
      animation: { /* animation values */ },
    },
  },
  plugins: [],
};
```

## API Endpoints

1. **POST /api/generate-report**
   - Accepts URL, email, and name
   - Performs SEO analysis
   - Returns success/failure with report details

2. **GET /api/reports/:id** (planned)
   - Retrieves a specific report
   - Requires valid report ID

## Testing Strategy

- **Unit Tests**: Jest for utility functions and components (planned)
- **Integration Tests**: Testing Library for component interactions (planned)
- **E2E Tests**: Cypress for full user flows (planned)
- **API Tests**: Supertest for API endpoints (planned) 