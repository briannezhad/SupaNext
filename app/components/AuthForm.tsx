'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/routes'

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'forgot-password'
}

interface AuthFormWithRedirectProps extends AuthFormProps {
  redirectTo?: string
}

/**
 * Reusable authentication form component.
 * Handles sign in, sign up, and password reset flows.
 * Uses client-side Supabase authentication for reliable cookie handling.
 */
export function AuthForm({ mode, redirectTo }: AuthFormWithRedirectProps) {
  const supabase = createClientComponentClient()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const redirectToValue = formData.get('redirectTo') as string | null

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        // Wait a moment for cookies to be fully set, then redirect
        const target = redirectToValue || redirectTo || ROUTES.DASHBOARD
        
        // Verify session one more time
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        
        if (finalSession) {
          // Clear loading state first
          setIsLoading(false)
          
          // Wait for cookies to be fully written
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Use a more reliable redirect method
          // Force a full page reload to ensure middleware sees the session
          if (target.startsWith('/')) {
            // Absolute path - use full URL
            window.location.href = `${window.location.origin}${target}`
          } else {
            window.location.href = target
          }
        } else {
          setError('Session not established. Please try again.')
          setIsLoading(false)
        }
      } else if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        // Success - redirect to dashboard
        setTimeout(() => {
          window.location.href = ROUTES.DASHBOARD
        }, 100)
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${ROUTES.AUTH_RESET_PASSWORD}`,
        })

        if (resetError) {
          setError(resetError.message)
        } else {
          setMessage('Password reset email sent')
        }
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {redirectTo && mode === 'signin' && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      {error && (
        <div className="p-3 bg-stripe-red-bg border border-stripe-red rounded-md">
          <p className="text-sm text-stripe-red">{error}</p>
        </div>
      )}
      {message && (
        <div className="p-3 bg-stripe-green-bg border border-stripe-green rounded-md">
          <p className="text-sm text-stripe-green">{message}</p>
        </div>
      )}

      {(mode === 'signin' || mode === 'signup') && (
        <>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stripe-dark mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-stripe-border rounded-md text-stripe-dark placeholder-stripe-gray focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stripe-dark mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              className="w-full px-3 py-2 border border-stripe-border rounded-md text-stripe-dark placeholder-stripe-gray focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:border-transparent"
              placeholder="••••••••"
            />
            {mode === 'signup' && (
              <p className="mt-1 text-xs text-stripe-gray">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-stripe-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'forgot-password' && (
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stripe-dark mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-stripe-border rounded-md text-stripe-dark placeholder-stripe-gray focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stripe-purple text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? 'Loading...'
          : mode === 'signin'
          ? 'Sign in'
          : mode === 'signup'
          ? 'Sign up'
          : 'Send reset link'}
      </button>
    </form>
  )
}

