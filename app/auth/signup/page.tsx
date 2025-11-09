import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/app/components/AuthForm'
import { AuthRedirect } from '@/app/components/AuthRedirect'
import { ROUTES } from '@/lib/routes'

export default async function SignUpPage() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(ROUTES.DASHBOARD)
  }

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
            Create an account
          </h1>
          <p className="text-sm text-stripe-gray">
            Sign up to get started
          </p>
        </div>

        <div className="bg-white border border-stripe-border rounded-md p-6">
          <AuthRedirect redirectTo={ROUTES.DASHBOARD} />
          <AuthForm mode="signup" />

          <div className="mt-6 text-center text-sm text-stripe-gray">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-stripe-purple hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

