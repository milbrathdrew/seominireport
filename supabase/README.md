# Supabase Integration (Optional)

This directory contains the Supabase database schema and setup instructions for future enhancement of the Mini SEO Report application.

> **Note:** The current version of the application uses a simplified approach without Supabase dependency. The information below is provided for future reference when database integration is needed.

## Setting Up Supabase

If you decide to integrate with Supabase in the future, follow these steps:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project 
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `schema.sql` and run it to create the necessary tables and policies
5. Get your project URL and anon key from the API settings
6. Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Structure

The database consists of two main tables:

### Leads Table
Stores information about users who have requested SEO reports:

- `id` - Unique identifier (UUID)
- `name` - User's name
- `email` - User's email address
- `url` - Website URL they want to analyze
- `created_at` - Timestamp when the lead was created

### Reports Table
Stores SEO reports generated for leads:

- `id` - Unique identifier (UUID)
- `lead_id` - Reference to the lead who requested the report
- `url` - Website URL that was analyzed
- `scores` - JSON object containing scores
- `recommendations` - Array of recommendations for improving SEO
- `created_at` - Timestamp when the report was generated

## Row Level Security

The Supabase setup includes Row Level Security policies to ensure:

1. Authenticated service accounts can perform all operations
2. Anonymous users can insert new leads and reports
3. Anonymous users can only read reports associated with their email

## Development Notes

This setup is optional for the current version. The application currently functions without database integration, generating reports on demand without persistent storage. If database functionality is needed in the future, these instructions and schema can be used to implement it. 