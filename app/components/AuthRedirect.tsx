'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'

export function AuthRedirect({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirectTo || '/dashboard')
        router.refresh()
      }
    }
    
    checkAuth()
  }, [router, supabase, redirectTo])

  return null
}

