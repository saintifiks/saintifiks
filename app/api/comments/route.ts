import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/comments?articleId=xxx - Ambil komentar publik
// POST /api/comments - Tambah komentar (harus login)

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

    // [CATATAN] Tidak melakukan join ke auth.users karena tabel tersebut 
    // berada di schema auth dan tidak bisa diakses via PostgREST dengan anon key
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil komentar' },
        { status: 500 }
      )
    }

    // Format data untuk frontend - tampilkan "Pembaca" untuk semua
    const formattedComments = data?.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user_id,
      user_name: 'Pembaca',
      user_avatar: null,
    })) || []

    return NextResponse.json({ comments: formattedComments })
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
    // [RATE LIMITING] Cegah spam komentar — maks 5 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `comments:${clientIP}`,
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
    
    // Cek auth user — getUser() memverifikasi token ke server Supabase
    // Jangan pakai getSession() karena tidak memvalidasi token (hanya baca cookie)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Harus login untuk mengirim komentar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { article_id, content } = body

    if (!article_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'article_id dan content diperlukan' },
        { status: 400 }
      )
    }

    // [CATATAN] Simpan user_id tapi nama tidak ditampilkan demi privasi
    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id,
        user_id: user.id,
        content: content.trim(),
      })
      .select('id, content, created_at, user_id')
      .single()

    if (error) {
      console.error('Error inserting comment:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan komentar' },
        { status: 500 }
      )
    }

    // Format response untuk frontend
    const formattedComment = {
      ...data,
      user_name: 'Pembaca',
      user_avatar: null,
    }

    return NextResponse.json({ comment: formattedComment }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
