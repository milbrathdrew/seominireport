# Technical Context: Minimalist SEO Report Generator

## Technology Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useContext)
- **Form Handling**: React Hook Form
- **Animation**: Framer Motion (for subtle UI animations)

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **SEO Analysis**: Google Lighthouse API
- **HTML Parsing**: Cheerio
- **PDF Generation**: React-PDF
- **Email Service**: SendGrid or Mailgun

### Database
- **Storage**: Supabase (PostgreSQL)
- **Tables**:
  - Leads (user information)
  - Reports (analysis results)

### Deployment
- **Hosting**: Vercel
- **CI/CD**: Vercel GitHub integration

## Development Environment

### Required Tools
- Node.js (v14+)
- npm or yarn
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
NEXT_PUBLIC_BASE_URL=

# Lighthouse API (if using a hosted version)
LIGHTHOUSE_API_KEY=
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
    "next": "^12.0.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "tailwindcss": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "framer-motion": "^5.0.0",
    "lighthouse": "^9.0.0",
    "chrome-launcher": "^0.15.0",
    "cheerio": "^1.0.0",
    "react-pdf": "^5.0.0",
    "@sendgrid/mail": "^7.0.0",
    "@supabase/supabase-js": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^4.5.0",
    "eslint": "^8.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

## API Endpoints

1. **POST /api/generate-report**
   - Accepts URL, email, and name
   - Performs SEO analysis
   - Returns success/failure with report details

2. **GET /api/reports/:id**
   - Retrieves a specific report
   - Requires valid report ID

## Testing Strategy

- **Unit Tests**: Jest for utility functions and components
- **Integration Tests**: Testing Library for component interactions
- **E2E Tests**: Cypress for full user flows
- **API Tests**: Supertest for API endpoints 