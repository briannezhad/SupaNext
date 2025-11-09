'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

type AuthFormState = {
  error?: string
  message?: string
  success?: boolean
  redirectTo?: string
} | null

export async function signUp(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signIn(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const redirectTo = formData.get('redirectTo') as string | null

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure session is refreshed
  await supabase.auth.getSession()

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')
  
  return { success: true, redirectTo: redirectTo || '/dashboard' }
}

export async function signOut() {
  const supabase = await createServerComponentClient()
  
  // Sign out and clear session
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
  }
  
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')
  
  // Redirect to login
  redirect('/login')
}

export async function resetPassword(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { message: 'Password reset email sent' }
}

export async function updatePassword(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerComponentClient()

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

