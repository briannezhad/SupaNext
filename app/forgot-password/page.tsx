import Link from 'next/link'
import { AuthForm } from '@/app/components/AuthForm'
import { ROUTES } from '@/lib/routes'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stripe-bg py-12 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-stripe-gray">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-white border border-stripe-border rounded-md p-6">
          <AuthForm mode="forgot-password" />

          <div className="mt-6 text-center text-sm text-stripe-gray">
            <Link href={ROUTES.LOGIN} className="text-stripe-purple hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

