# Supabase RLS Setup Guide

This guide provides instructions for setting up Row Level Security (RLS) for the Supabase database used in this application.

## The Issue

When using Supabase with Row Level Security (RLS) enabled, you need to use the service role key to bypass RLS for operations in server-side API routes. 

The error you'll see without proper setup is:
```
Error storing lead: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "leads"'
}
```

## Solution 1: Using Service Role Key (Recommended for Production)

1. Get your service role key from the Supabase dashboard under Project Settings > API
2. Add it to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Make sure the service role key is the complete key in JWT format, similar to:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzQ1NjQwMDAsImV4cCI6MTk1MDE2NDAwMH0.your-signature
   ```
4. Restart your development server to pick up the changes

## Solution 2: Disabling RLS for Development (Easier but Less Secure)

If you're having trouble with the service role key, you can temporarily disable RLS for development:

1. Go to the Supabase SQL Editor
2. Run the following SQL commands:
   ```sql
   ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
   ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
   ```
3. To re-enable RLS later (for production), run:
   ```sql
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
   ```

## Fallback in the App

The application now includes a fallback mechanism:
- If database storage fails, it will use the `/api/analyze-only` endpoint
- This allows the app to still provide analysis results without storing data
- You'll see a console warning: "Database storage failed, falling back to analysis-only mode"

## Testing Your Setup

1. Test the environment variables:
   ```
   curl http://localhost:3000/api/test-env
   ```

2. Test database access (if using service role key):
   ```
   curl http://localhost:3000/api/test-db
   ```

3. Test the fallback endpoint:
   ```
   curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com"}' http://localhost:3000/api/analyze-only
   ```

## Troubleshooting

- If you see "Invalid API key" errors, double-check that your service role key is the complete JWT token
- Make sure there are no line breaks or spaces in your environment variables
- Try restarting your development server after changing environment variables
- Check if RLS is enabled on your Supabase tables by inspecting table settings
- Verify that your service role key has the necessary permissions 