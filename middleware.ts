import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { requiresAuth, requiresGuest, getRedirectPath, ROUTES } from '@/lib/routes/config'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session - this will read cookies and refresh if needed
  // Call getSession first to ensure cookies are read properly
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Also get user to ensure we have full auth state
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  // User is authenticated if we have either a session or a user
  const isAuthenticated = !!(session?.user || user)

  // Dashboard uses client-side auth, so allow it through
  // The client component will handle redirects
  if (pathname === ROUTES.DASHBOARD) {
    return supabaseResponse
  }

  // Use routing config to determine access
  const redirectPath = getRedirectPath(pathname as any, isAuthenticated)

  if (redirectPath) {
    const url = request.nextUrl.clone()
    
    // If redirecting to login, preserve the original destination
    if (redirectPath === ROUTES.LOGIN && pathname !== ROUTES.LOGIN) {
      url.pathname = ROUTES.LOGIN
      url.searchParams.set('redirectTo', pathname)
    } else {
      url.pathname = redirectPath
    }
    
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

