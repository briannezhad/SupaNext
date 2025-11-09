import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/app/components/AuthForm'

export default async function SignUpPage() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stripe-bg py-12 px-6">
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
          <AuthForm mode="signup" />

          <div className="mt-6 text-center text-sm text-stripe-gray">
            Already have an account?{' '}
            <Link href="/login" className="text-stripe-purple hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

