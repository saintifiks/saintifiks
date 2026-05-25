// API route: /api/opinion-shares
// POST — catat share artikel opinions (harus login)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — sama dengan shares editorial: 5 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `opinion-shares:${clientIP}`,
      RATE_LIMITS.shares.limit,
      RATE_LIMITS.shares.windowMs
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak share. Silakan tunggu sebentar.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Verifikasi auth — getUser() memvalidasi token ke server Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Harus login untuk mencatat share' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { opinion_article_id, platform } = body

    if (!opinion_article_id || !platform) {
      return NextResponse.json(
        { error: 'opinion_article_id dan platform diperlukan' },
        { status: 400 }
      )
    }

    const validPlatforms = ['instagram', 'twitter', 'facebook', 'whatsapp', 'copy']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Platform tidak valid' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('opinion_shares')
      .insert({
        opinion_article_id,
        user_id: user.id,
        platform,
      })
      .select()
      .single()

    if (error) {
      console.error('[opinion-shares POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mencatat share' }, { status: 500 })
    }

    return NextResponse.json({ share: data }, { status: 201 })
  } catch (err) {
    console.error('[opinion-shares POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
