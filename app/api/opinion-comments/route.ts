// API route: /api/opinion-comments
// GET  — ambil komentar untuk satu artikel opinions
// POST — tambah komentar baru (harus login)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// GET /api/opinion-comments?articleId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'articleId diperlukan' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('opinion_comments')
      .select('id, content, created_at, user_id')
      .eq('opinion_article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[opinion-comments GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil komentar' }, { status: 500 })
    }

    // Privasi: semua komentar tampil sebagai "Pembaca" — konsisten dengan komentar editorial
    const formatted = (data ?? []).map((c) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      user_name: 'Pembaca',
      user_avatar: null,
    }))

    return NextResponse.json({ comments: formatted })
  } catch (err) {
    console.error('[opinion-comments GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/opinion-comments — tambah komentar baru
export async function POST(request: NextRequest) {
  try {
    // Rate limiting — sama dengan komentar editorial: 5 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `opinion-comments:${clientIP}`,
      RATE_LIMITS.comments.limit,
      RATE_LIMITS.comments.windowMs
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak komentar. Silakan tunggu sebentar.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Verifikasi auth — getUser() memvalidasi token ke server Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Harus login untuk mengirim komentar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { opinion_article_id, content } = body

    if (!opinion_article_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'opinion_article_id dan content diperlukan' },
        { status: 400 }
      )
    }

    // Verifikasi artikel opinions ada dan statusnya published
    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id')
      .eq('id', opinion_article_id)
      .eq('status', 'published')
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('opinion_comments')
      .insert({
        opinion_article_id,
        user_id: user.id,
        content: content.trim(),
      })
      .select('id, content, created_at, user_id')
      .single()

    if (error) {
      console.error('[opinion-comments POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal menyimpan komentar' }, { status: 500 })
    }

    const formatted = {
      ...data,
      user_name: 'Pembaca',
      user_avatar: null,
    }

    return NextResponse.json({ comment: formatted }, { status: 201 })
  } catch (err) {
    console.error('[opinion-comments POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
