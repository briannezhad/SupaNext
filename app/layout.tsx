import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SupaNext Boilerplate',
  description: 'Next.js + Supabase Docker Boilerplate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

