import { createBrowserClient } from "@supabase/ssr";

// In Vite/Remix, client-side env vars must be prefixed with VITE_ to be exposed to the browser
// Check for VITE_ prefixed vars first, then fallback to non-prefixed (for backwards compatibility)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '⚠️ Supabase environment variables are missing!\n\n' +
    'Please set the following in your .env file:\n' +
    '- VITE_SUPABASE_URL (or SUPABASE_URL)\n' +
    '- VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_KEY or SUPABASE_KEY)\n\n' +
    'Note: In Vite, client-side variables must be prefixed with VITE_ to be exposed to the browser.\n' +
    'The Supabase client will not work until these are set.'
  );
}

// Create client with fallback empty strings if env vars are missing
// This prevents the module from crashing, but operations will fail
export const supabase = createBrowserClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
);