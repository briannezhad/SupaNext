import { createServerComponentClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/lib/routes'

/**
 * Handles OAuth callbacks and email verification links.
 * Exchanges the authorization code for a session.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || ROUTES.DASHBOARD

  if (code) {
    const supabase = await createServerComponentClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return to login with error message
  return NextResponse.redirect(
    new URL(`${ROUTES.LOGIN}?error=Could not authenticate`, requestUrl.origin)
  )
}

