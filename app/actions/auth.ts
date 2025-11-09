'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'

type AuthFormState = {
  error?: string
  message?: string
  success?: boolean
  redirectTo?: string
} | null

/**
 * Server action to sign out the current user.
 * Used by the home page sign out button.
 */
export async function signOut() {
  const supabase = await createServerComponentClient()
  
  // Sign out and clear session
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
  }
  
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')
  
  // Redirect to home
  redirect(ROUTES.HOME)
}

/**
 * Server action to send a password reset email.
 * Note: This is kept for potential future use, but password reset
 * is currently handled client-side in AuthForm component.
 */
export async function resetPassword(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${ROUTES.AUTH_RESET_PASSWORD}`,
  })

  if (error) {
    return { error: error.message }
  }

  return { message: 'Password reset email sent' }
}

/**
 * Server action to update user password.
 * Used in the reset password page after email verification.
 */
export async function updatePassword(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(ROUTES.DASHBOARD)
}

