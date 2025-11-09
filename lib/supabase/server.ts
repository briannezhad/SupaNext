import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

/**
 * Server-side Supabase client with service role key
 * Use this for admin operations and server-side API routes
 */
export function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

