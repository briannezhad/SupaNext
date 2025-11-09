import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Simple health check - verify we can reach Supabase
    // Try to get auth status (doesn't require any tables)
    const { error } = await supabase.auth.getUser()
    
    // These errors actually mean Supabase is working correctly:
    // - "Auth session missing!" = no user logged in (expected)
    // - "Invalid JWT" = no valid session (expected)
    // - "JWT expired" = session expired (expected)
    const isConnected = !error || 
      error.message.includes('Auth session missing') ||
      error.message.includes('Invalid JWT') ||
      error.message.includes('JWT expired') ||
      error.message.includes('Unable to parse or verify signature')
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: isConnected ? 'connected' : 'disconnected',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

