'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/routes'

/**
 * Component that automatically redirects authenticated users.
 * Used on login/signup pages to redirect users who are already logged in.
 */
export function AuthRedirect({ redirectTo }: { redirectTo?: string }) {
  const supabase = createClientComponentClient()

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    
    const checkAuth = async () => {
      // Check for session immediately
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const target = redirectTo || ROUTES.DASHBOARD
        // Use window.location for reliable redirect
        window.location.href = target
        return
      }
      
      // Also listen for auth state changes
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          const target = redirectTo || ROUTES.DASHBOARD
          window.location.href = target
        }
      })
      
      subscription = sub
    }
    
    checkAuth()
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase, redirectTo])

  return null
}

