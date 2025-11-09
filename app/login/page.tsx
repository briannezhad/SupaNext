import Link from 'next/link'
import { AuthForm } from '@/app/components/AuthForm'
import { AuthRedirect } from '@/app/components/AuthRedirect'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stripe-bg py-12 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
            Sign in
          </h1>
          <p className="text-sm text-stripe-gray">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white border border-stripe-border rounded-md p-6">
          <AuthRedirect redirectTo={searchParams.redirectTo} />
          <AuthForm mode="signin" redirectTo={searchParams.redirectTo} />

          <div className="mt-6 text-center text-sm text-stripe-gray">
            Don't have an account?{' '}
            <Link href="/signup" className="text-stripe-purple hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

