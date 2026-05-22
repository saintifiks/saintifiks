import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users: user_id (raw_user_meta_data)
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil komentar' },
        { status: 500 }
      )
    }

    // Format data untuk frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedComments = data?.map((comment: any) => {
      const userMeta = comment.users?.raw_user_meta_data
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user_name: userMeta?.name || 'Pembaca',
        user_avatar: userMeta?.avatar_url || null,
      }
    }) || []

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
    const supabase = await createClient()
    
    // Cek session user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
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

    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id,
        user_id: session.user.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting comment:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan komentar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
