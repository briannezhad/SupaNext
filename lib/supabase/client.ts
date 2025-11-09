import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in client components.
 * This client handles authentication cookies automatically.
 */
export function createClientComponentClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

