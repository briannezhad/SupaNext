'use client'

import { useFormState } from 'react-dom'
import { updatePassword } from '@/app/actions/auth'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/routes'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [state, formAction] = useFormState(updatePassword, null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.LOGIN)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  return (
    <main className="min-h-screen flex items-center justify-center bg-stripe-bg py-12 px-6 relative">
      <Link
        href={ROUTES.HOME}
        className="absolute top-6 left-6 text-sm text-stripe-gray hover:text-stripe-dark transition-colors flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to home
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-stripe-gray">
            Enter your new password
          </p>
        </div>

        <div className="bg-white border border-stripe-border rounded-md p-6">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 bg-stripe-red-bg border border-stripe-red rounded-md">
                <p className="text-sm text-stripe-red">{state.error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stripe-dark mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-stripe-border rounded-md text-stripe-dark placeholder-stripe-gray focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-stripe-gray">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-stripe-purple text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 font-medium transition-colors"
            >
              Update password
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stripe-gray">
            <Link href={ROUTES.DASHBOARD} className="text-stripe-purple hover:underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

