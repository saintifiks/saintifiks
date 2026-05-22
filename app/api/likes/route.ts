import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/likes — tambah like
export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'articleId diperlukan' }, { status: 400 })
    }

    // Verifikasi user yang login via cookie session
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createAdminClient()

    // Cek apakah sudah like (hindari duplikat)
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'Sudah disukai' }, { status: 200 })
    }

    const { error } = await supabase
      .from('likes')
      .insert({ article_id: articleId, user_id: userId })

    if (error) {
      console.error('Error inserting like:', error)
      return NextResponse.json({ error: 'Gagal menyimpan like' }, { status: 500 })
    }

    // Ambil count terbaru
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId)

    return NextResponse.json({ success: true, count: count || 0 }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/likes — hapus like
export async function DELETE(request: NextRequest) {
  try {
    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: 'articleId diperlukan' }, { status: 400 })
    }

    // Verifikasi user yang login via cookie session
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting like:', error)
      return NextResponse.json({ error: 'Gagal menghapus like' }, { status: 500 })
    }

    // Ambil count terbaru
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId)

    return NextResponse.json({ success: true, count: count || 0 }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET /api/likes?articleId=xxx — cek status like user saat ini
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'articleId diperlukan' }, { status: 400 })
    }

    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ isLiked: false }, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    const supabase = createAdminClient()

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    return NextResponse.json({ isLiked: !!data }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ isLiked: false }, { status: 500 })
  }
}
