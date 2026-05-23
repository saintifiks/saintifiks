import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Verifikasi user — getUser() memvalidasi token ke server Supabase
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      event_type: body.event_type,
      path: body.path,
      session_id: body.session_id || 'anonymous',
      user_id: user?.id || null,
      metadata: body.metadata || {}
    }

    const { error } = await supabase.from('analytics_events').insert(payload)

    if (error) {
      console.error('[Analytics] Gagal merekam event:', error)
    }

    // Selalu kembalikan 200 OK agar tidak membebani log frontend pembaca
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Analytics] Terjadi kesalahan internal:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}