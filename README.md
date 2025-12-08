<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1T_KeBSnT9eABFWpZvjXlsgLsGfSfu4zO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure environment variables in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_gemini_key
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
   ```
3. Prepare Supabase (once per project):
   - Create a table by running [`supabase/app_memory_test.sql`](supabase/app_memory_test.sql) in the SQL editor.
   - Ensure Row Level Security policies allow anonymous read/write for testing (included in the SQL file).
4. Run the app:
   `npm run dev`
