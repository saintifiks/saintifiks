// API route: /api/opinion-corrections
// GET  — ambil koreksi yang sudah disetujui untuk satu artikel opinions
// POST — submit koreksi baru (harus login)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// GET /api/opinion-corrections?articleId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'articleId diperlukan' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('opinion_corrections')
      .select('id, original_text, corrected_text, explanation, created_at')
      .eq('opinion_article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[opinion-corrections GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil koreksi' }, { status: 500 })
    }

    return NextResponse.json({ corrections: data ?? [] })
  } catch (err) {
    console.error('[opinion-corrections GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/opinion-corrections — submit koreksi baru
export async function POST(request: NextRequest) {
  try {
    // Rate limiting — sama dengan komentar: 5 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`opinion-corrections:${clientIP}`, 5, 60_000)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Verifikasi auth — getUser() memvalidasi token ke server Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Anda harus login untuk mengusulkan koreksi.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { opinion_article_id, original_text, corrected_text, explanation } = body

    if (!opinion_article_id || !original_text?.trim() || !corrected_text?.trim()) {
      return NextResponse.json(
        { error: 'opinion_article_id, original_text, dan corrected_text wajib diisi' },
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

    // Insert menggunakan admin client agar tidak terblokir RLS
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('opinion_corrections')
      .insert({
        opinion_article_id,
        user_id: user.id,
        original_text: original_text.trim(),
        corrected_text: corrected_text.trim(),
        explanation: explanation?.trim() || null,
        status: 'pending',
      })

    if (error) {
      console.error('[opinion-corrections POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengirim koreksi' }, { status: 500 })
    }

    return NextResponse.json({ sukses: true }, { status: 201 })
  } catch (err) {
    console.error('[opinion-corrections POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
