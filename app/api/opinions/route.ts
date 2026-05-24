// API route: /api/opinions
// GET  — mengambil daftar artikel milik user yang sedang login (untuk dashboard /akun)
// POST — membuat artikel baru (status awal: draft)

import { NextRequest, NextResponse } from 'next/server'
import { generateSlug } from '@/lib/slug'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET — daftar semua artikel milik user (semua status: draft, published, hidden)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: articles, error } = await supabase
      .from('opinion_articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        status,
        slug_locked,
        published_at,
        created_at,
        updated_at,
        opinion_likes(count),
        opinion_analytics_events(count)
      `)
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[opinions GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil artikel' }, { status: 500 })
    }

    // Normalisasi count dari relasi Supabase
    const result = (articles ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      cover_image_url: a.cover_image_url,
      status: a.status,
      slug_locked: a.slug_locked,
      published_at: a.published_at,
      created_at: a.created_at,
      updated_at: a.updated_at,
      like_count: Array.isArray(a.opinion_likes) ? (a.opinion_likes[0] as { count: number })?.count ?? 0 : 0,
      view_count: Array.isArray(a.opinion_analytics_events)
        ? (a.opinion_analytics_events as { count: number }[]).find(() => true)?.count ?? 0
        : 0,
    }))

    return NextResponse.json({ articles: result })
  } catch (err) {
    console.error('[opinions GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — buat artikel baru
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Pastikan user sudah punya profil
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'Lengkapi profil dulu sebelum membuat artikel' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.content === 'string' ? body.content : ''
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : null
    const coverImageUrl = typeof body.cover_image_url === 'string' ? body.cover_image_url.trim() : null

    // Validasi judul
    if (!title) {
      return NextResponse.json({ error: 'Judul artikel wajib diisi' }, { status: 400 })
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Judul maksimal 200 karakter' }, { status: 400 })
    }
    if (content.length > 50000) {
      return NextResponse.json({ error: 'Konten maksimal 50.000 karakter' }, { status: 400 })
    }

    // Generate slug dari judul
    let slug = generateSlug(title)
    if (!slug || slug.length < 2) {
      slug = `artikel-${Date.now()}`
    }

    // Pastikan slug unik per author — tambahkan suffix jika perlu
    let finalSlug = slug
    let attempt = 2
    while (true) {
      const { data: existing } = await supabase
        .from('opinion_articles')
        .select('id')
        .eq('author_id', user.id)
        .eq('slug', finalSlug)
        .maybeSingle()

      if (!existing) break
      finalSlug = `${slug}-${attempt}`
      attempt++
    }

    // author_id SELALU dari session — tidak dari request body (keamanan)
    const { data: article, error } = await supabase
      .from('opinion_articles')
      .insert({
        author_id: user.id,
        title,
        slug: finalSlug,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('[opinions POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal membuat artikel' }, { status: 500 })
    }

    return NextResponse.json({ article }, { status: 201 })
  } catch (err) {
    console.error('[opinions POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
