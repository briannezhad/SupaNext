'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function DashboardClient() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    // Don't check auth if we're signing out
    if (isSigningOut) {
      return
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        // No session, redirect to login
        router.push('/login?redirectTo=/dashboard')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't restore session if user just signed out
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
        router.push('/login')
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else if (!isSigningOut) {
        // Only redirect if not in the process of signing out
        router.push('/login?redirectTo=/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, isSigningOut])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Clear user state immediately to prevent UI flicker
      setUser(null)
      
      // Sign out from Supabase (clears session and cookies)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        setIsSigningOut(false)
        return
      }

      // Clear any remaining cookies manually as a safety measure
      // This ensures all auth-related cookies are removed
      const cookies = document.cookie.split(';')
      cookies.forEach((c) => {
        const cookieName = c.trim().split('=')[0]
        if (cookieName.includes('sb-') || cookieName.includes('auth') || cookieName.includes('supabase')) {
          // Clear for all possible paths and domains
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
        }
      })

      // Wait a moment to ensure sign out completes and cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Verify session is actually cleared
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // If session still exists, force clear it
        await supabase.auth.signOut()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Force a hard redirect to login to ensure clean state
      // Using replace to prevent back button from going to dashboard
      window.location.replace('/login')
    } catch (err) {
      console.error('Sign out error:', err)
      // Even on error, try to redirect
      window.location.replace('/login')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stripe-bg py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-stripe-bg py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-stripe-gray">
              Welcome back, {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 text-sm font-medium text-stripe-dark bg-white border border-stripe-border rounded-md hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>

        <div className="bg-white border border-stripe-border rounded-md p-6">
          <h2 className="text-lg font-semibold text-stripe-dark mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-stripe-gray mb-1">Email</div>
              <div className="text-sm text-stripe-dark">{user.email}</div>
            </div>
            <div>
              <div className="text-xs text-stripe-gray mb-1">User ID</div>
              <div className="text-sm text-stripe-dark font-mono">
                {user.id}
              </div>
            </div>
            <div>
              <div className="text-xs text-stripe-gray mb-1">Email Verified</div>
              <div className="text-sm text-stripe-dark">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-xs text-stripe-gray mb-1">Created At</div>
              <div className="text-sm text-stripe-dark">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-stripe-border rounded-md p-6">
          <h2 className="text-lg font-semibold text-stripe-dark mb-4">
            Protected Route
          </h2>
          <p className="text-sm text-stripe-gray">
            This page is protected and only accessible to authenticated users.
            The middleware automatically redirects unauthenticated users to the
            login page.
          </p>
        </div>
      </div>
    </main>
  )
}

