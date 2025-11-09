import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes that require authentication
  // Note: Dashboard now handles auth client-side, so we allow it through
  // The client component will redirect if not authenticated
  // if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   url.searchParams.set('redirectTo', request.nextUrl.pathname)
  //   return NextResponse.redirect(url)
  // }

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname.startsWith('/login') || 
       request.nextUrl.pathname.startsWith('/signup')) && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
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

