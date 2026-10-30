import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client to be used inside Client Components (running in the browser).
 * It reads the public URL and anon key from environment variables.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables! Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}

