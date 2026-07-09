import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || ''

    if (q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Rate Limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `koreksi-search:${clientIP}`,
      RATE_LIMITS.search.limit,
      RATE_LIMITS.search.windowMs
    )

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan pencarian. Silakan coba lagi nanti.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Sanitasi input wildcard untuk ilike (% dan _)
    const escapedQ = q.replace(/[\\%_]/g, '\\$&')

    // Query 1: Artikel Editorial
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt')
      .eq('is_published', true)
      .ilike('title', `%${escapedQ}%`)
      .order('published_at', { ascending: false })
      .limit(5)

    if (articlesError) {
      throw articlesError
    }

    // Query 2: Argumen (Opinions)
    const { data: opinions, error: opinionsError } = await supabase
      .from('opinion_articles')
      .select('id, title, slug, excerpt, author_id')
      .eq('status', 'published')
      .ilike('title', `%${escapedQ}%`)
      .order('published_at', { ascending: false })
      .limit(5)

    if (opinionsError) {
      throw opinionsError
    }

    // Query 3: User profiles penulis (terpisah, tidak inline join)
    const profileMap = new Map<string, string>()
    if (opinions && opinions.length > 0) {
      const authorIds = Array.from(
        new Set(opinions.map((o) => o.author_id).filter(Boolean))
      )

      if (authorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', authorIds)

        if (profilesError) {
          throw profilesError
        }

        if (profiles) {
          for (const p of profiles) {
            profileMap.set(p.user_id, p.username)
          }
        }
      }
    }

    // Pemetaan hasil editorial
    const mappedArticles = (articles ?? []).map((art) => ({
      type: 'artikel' as const,
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || '',
    }))

    // Pemetaan hasil argumen
    const mappedOpinions = (opinions ?? []).map((op) => ({
      type: 'argumen' as const,
      id: op.id,
      title: op.title,
      slug: op.slug,
      excerpt: op.excerpt || '',
      authorUsername: profileMap.get(op.author_id) || '',
    }))

    // Gabungkan hasil
    const results = [...mappedArticles, ...mappedOpinions]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[koreksi/search GET] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    )
  }
}
