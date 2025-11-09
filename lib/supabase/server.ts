import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function createServerComponentClient() {
  const cookieStore = await cookies()

  // Use internal Docker service name for server-side requests
  // Replace localhost with kong service name when running in Docker
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
  const supabaseUrl = publicUrl.replace('localhost:8000', 'kong:8000').replace('127.0.0.1:8000', 'kong:8000')

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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// For direct server-side operations (API routes, server actions)
// Uses service role key for admin operations
export function createServiceClient() {
  // Use internal Docker service name for server-side requests
  // Replace localhost with kong service name when running in Docker
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
  const supabaseUrl = publicUrl.replace('localhost:8000', 'kong:8000').replace('127.0.0.1:8000', 'kong:8000')
  
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

