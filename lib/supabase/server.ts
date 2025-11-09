import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

/**
 * Gets the internal Supabase URL for server-side requests.
 * Replaces localhost with the Docker service name 'kong' when running in Docker.
 */
function getInternalSupabaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
  return publicUrl
    .replace('localhost:8000', 'kong:8000')
    .replace('127.0.0.1:8000', 'kong:8000')
}

/**
 * Creates a Supabase client for use in server components.
 * This client reads and writes authentication cookies automatically.
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getInternalSupabaseUrl()

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client with service role key for admin operations.
 * Use this only in API routes or server actions that need elevated permissions.
 * ⚠️ Never expose this client to the client-side!
 */
export function createServiceClient() {
  const supabaseUrl = getInternalSupabaseUrl()
  
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

