import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/shares?articleId=xxx - Ambil jumlah share per platform
// POST /api/shares - Catat share baru (harus login)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId diperlukan' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shares')
      .select('platform')
      .eq('article_id', articleId)

    if (error) {
      console.error('Error fetching shares:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data share' },
        { status: 500 }
      )
    }

    // Hitung jumlah per platform
    const counts = {
      instagram: 0,
      twitter: 0,
      facebook: 0,
      whatsapp: 0,
      copy: 0,
      total: 0,
    }

    data?.forEach((share) => {
      if (counts[share.platform as keyof typeof counts] !== undefined) {
        counts[share.platform as keyof typeof counts]++
      }
      counts.total++
    })

    return NextResponse.json({ counts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // [RATE LIMITING] Cegah abuse share — maks 5 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `shares:${clientIP}`,
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
    
    // Cek auth user — getUser() memverifikasi token ke server Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Harus login untuk mencatat share' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { article_id, platform } = body

    if (!article_id || !platform) {
      return NextResponse.json(
        { error: 'article_id dan platform diperlukan' },
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

    const { data, error } = await supabase
      .from('shares')
      .insert({
        article_id,
        user_id: user.id,
        platform,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting share:', error)
      return NextResponse.json(
        { error: 'Gagal mencatat share' },
        { status: 500 }
      )
    }

    return NextResponse.json({ share: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
