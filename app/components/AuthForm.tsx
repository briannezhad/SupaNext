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
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)

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

  const handleOAuthSignIn = async (provider: 'google' | 'twitter' | 'linkedin') => {
    setError(null)
    setIsOAuthLoading(provider)

    try {
      const target = redirectTo || ROUTES.DASHBOARD
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}?next=${encodeURIComponent(target)}`,
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setIsOAuthLoading(null)
      }
      // If successful, the user will be redirected to the OAuth provider
      // and then back to the callback route
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign in failed')
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {(mode === 'signin' || mode === 'signup') && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isOAuthLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-stripe-border rounded-md bg-white text-stripe-dark hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOAuthLoading === 'google' ? (
              <span className="text-sm">Loading...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('twitter')}
            disabled={isOAuthLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-stripe-border rounded-md bg-white text-stripe-dark hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOAuthLoading === 'twitter' ? (
              <span className="text-sm">Loading...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm font-medium">Continue with X</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('linkedin')}
            disabled={isOAuthLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-stripe-border rounded-md bg-white text-stripe-dark hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOAuthLoading === 'linkedin' ? (
              <span className="text-sm">Loading...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm font-medium">Continue with LinkedIn</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stripe-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stripe-gray">Or continue with email</span>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}

