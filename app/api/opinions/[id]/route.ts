// API route: /api/opinions/[id]
// GET    — mengambil detail satu artikel beserta chart configs (hanya milik sendiri)
// PATCH  — mengupdate artikel (tidak bisa update status via endpoint ini)
// DELETE — menghapus artikel (hanya draft)

import { NextRequest, NextResponse } from 'next/server'
import { generateSlug } from '@/lib/slug'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET — detail artikel + chart configs
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: article, error } = await supabase
      .from('opinion_articles')
      .select('*')
      .eq('id', params.id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[opinions/[id] GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil artikel' }, { status: 500 })
    }

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    // Ambil chart configs untuk artikel ini
    const { data: charts } = await supabase
      .from('opinion_article_charts')
      .select('id, chart_id, config, created_at')
      .eq('opinion_article_id', params.id)

    return NextResponse.json({ article, charts: charts ?? [] })
  } catch (err) {
    console.error('[opinions/[id] GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH — update artikel (title, content, excerpt, cover_image_url)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Ambil artikel — pastikan milik user ini
    const { data: existing, error: fetchError } = await supabase
      .from('opinion_articles')
      .select('id, author_id, slug, slug_locked, status')
      .eq('id', params.id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.title === 'string') {
      const title = body.title.trim()
      if (!title) return NextResponse.json({ error: 'Judul tidak boleh kosong' }, { status: 400 })
      if (title.length > 200) return NextResponse.json({ error: 'Judul maksimal 200 karakter' }, { status: 400 })
      updates.title = title

      // Update slug hanya jika belum terkunci
      if (!existing.slug_locked) {
        let newSlug = generateSlug(title)
        if (!newSlug || newSlug.length < 2) newSlug = `artikel-${Date.now()}`

        let finalSlug = newSlug
        let attempt = 2
        while (true) {
          const { data: slugExisting } = await supabase
            .from('opinion_articles')
            .select('id')
            .eq('author_id', user.id)
            .eq('slug', finalSlug)
            .neq('id', params.id)
            .maybeSingle()

          if (!slugExisting) break
          finalSlug = `${newSlug}-${attempt}`
          attempt++
        }
        updates.slug = finalSlug
      }
    }

    if (typeof body.content === 'string') {
      if (body.content.length > 50000) {
        return NextResponse.json({ error: 'Konten maksimal 50.000 karakter' }, { status: 400 })
      }
      updates.content = body.content
    }

    if (typeof body.excerpt === 'string') {
      updates.excerpt = body.excerpt.trim() || null
    }

    if (typeof body.cover_image_url === 'string') {
      updates.cover_image_url = body.cover_image_url.trim() || null
    }

    // Status tidak bisa diubah via endpoint ini
    delete updates.status
    delete updates.author_id
    delete updates.slug_locked
    delete updates.published_at

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diupdate' }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('opinion_articles')
      .update(updates)
      .eq('id', params.id)
      .eq('author_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[opinions/[id] PATCH] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengupdate artikel' }, { status: 500 })
    }

    return NextResponse.json({ article })
  } catch (err) {
    console.error('[opinions/[id] PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — hapus artikel (hanya draft yang bisa dihapus user)
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

    // Cek status artikel sebelum hapus
    const { data: existing } = await supabase
      .from('opinion_articles')
      .select('id, author_id, status')
      .eq('id', params.id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Hanya artikel dengan status draft yang bisa dihapus' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('opinion_articles')
      .delete()
      .eq('id', params.id)
      .eq('author_id', user.id)

    if (error) {
      console.error('[opinions/[id] DELETE] Error:', error.message)
      return NextResponse.json({ error: 'Gagal menghapus artikel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[opinions/[id] DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
