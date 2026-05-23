// API route: /api/user-profiles/[username]
// GET — mengambil profil publik berdasarkan username + daftar artikel published-nya

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: 'Username diperlukan' }, { status: 400 })
    }

    const supabase = await createClient()

    // Ambil profil publik — hanya kolom yang aman (tidak expose user_id)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('username, display_name, bio, avatar_url, created_at')
      .eq('username', username)
      .maybeSingle()

    if (profileError) {
      console.error('[user-profiles/[username] GET] Error:', profileError.message)
      return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    }

    // Ambil user_id internal untuk query artikel (tidak di-expose ke response)
    const { data: profileWithId } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('username', username)
      .maybeSingle()

    let articles: unknown[] = []

    if (profileWithId) {
      // Ambil artikel published milik penulis ini, beserta like count
      const { data: articleData } = await supabase
        .from('opinion_articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image_url,
          published_at,
          opinion_likes(count)
        `)
        .eq('author_id', profileWithId.user_id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20)

      articles = (articleData ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        cover_image_url: a.cover_image_url,
        published_at: a.published_at,
        like_count: Array.isArray(a.opinion_likes) ? (a.opinion_likes[0] as { count: number })?.count ?? 0 : 0,
      }))
    }

    return NextResponse.json({ profile, articles })
  } catch (err) {
    console.error('[user-profiles/[username] GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
