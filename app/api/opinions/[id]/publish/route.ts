// API route: /api/opinions/[id]/publish
// POST   — publish artikel (draft → published)
// DELETE — jadikan draft kembali (published → draft)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST — publish artikel
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Pastikan user punya profil
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'Lengkapi profil dulu sebelum mempublish artikel' },
        { status: 403 }
      )
    }

    // Ambil artikel — pastikan milik user ini
    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id, author_id, title, content, status, published_at, slug_locked')
      .eq('id', params.id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    if (article.status === 'hidden') {
      return NextResponse.json(
        { error: 'Artikel yang disembunyikan admin tidak bisa dipublish kembali oleh penulis' },
        { status: 403 }
      )
    }

    // Validasi sebelum publish
    if (!article.title || article.title.trim().length === 0) {
      return NextResponse.json({ error: 'Judul artikel tidak boleh kosong' }, { status: 400 })
    }

    if (!article.content || article.content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Konten artikel minimal 100 karakter' },
        { status: 400 }
      )
    }

    // Set published_at hanya jika belum pernah dipublish sebelumnya
    const updates: Record<string, unknown> = {
      status: 'published',
      slug_locked: true,
    }

    if (!article.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data: updated, error } = await supabase
      .from('opinion_articles')
      .update(updates)
      .eq('id', params.id)
      .eq('author_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[opinions/[id]/publish POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mempublish artikel' }, { status: 500 })
    }

    return NextResponse.json({ article: updated })
  } catch (err) {
    console.error('[opinions/[id]/publish POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — jadikan draft (published → draft)
// Catatan: published_at dan slug_locked TIDAK berubah
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id, author_id, status')
      .eq('id', params.id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    if (article.status === 'hidden') {
      return NextResponse.json(
        { error: 'Artikel yang disembunyikan admin tidak bisa diubah statusnya oleh penulis' },
        { status: 403 }
      )
    }

    const { data: updated, error } = await supabase
      .from('opinion_articles')
      .update({ status: 'draft' })
      .eq('id', params.id)
      .eq('author_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[opinions/[id]/publish DELETE] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengubah status artikel' }, { status: 500 })
    }

    return NextResponse.json({ article: updated })
  } catch (err) {
    console.error('[opinions/[id]/publish DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
