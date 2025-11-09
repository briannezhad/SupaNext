'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/routes'

export function AuthRedirect({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to avoid race conditions with login
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const target = redirectTo || ROUTES.DASHBOARD
        // Use window.location for reliable redirect
        window.location.href = target
      }
    }
    
    checkAuth()
  }, [router, supabase, redirectTo])

  return null
}

