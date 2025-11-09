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
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || error || 'Could not authenticate'
    return NextResponse.redirect(
      new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  if (code) {
    const supabase = await createServerComponentClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Successful OAuth login - redirect to target page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return to login with error message
  return NextResponse.redirect(
    new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent('Could not authenticate')}`, requestUrl.origin)
  )
}

