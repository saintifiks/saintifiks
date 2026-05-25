// Halaman daftar artikel opinions — Server Component
// force-dynamic agar selalu fresh — tidak pakai ISR cache

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import OpinionCard from '@/components/opinions/OpinionCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Opinions — Saintifiks',
  description: 'Perspektif dan analisis dari pembaca Saintifiks.',
  openGraph: {
    title: 'Opinions — Saintifiks',
    description: 'Perspektif dan analisis dari pembaca Saintifiks.',
    siteName: 'Saintifiks',
  },
}

const PAGE_SIZE = 20

type SearchParams = { page?: string }

export default async function OpinionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Admin client untuk bypass RLS — fallback ke server client jika service key tidak tersedia
  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    console.error('[opinions/page] Admin client gagal, fallback ke server client')
    supabase = await createClient()
  }
  const page = Math.max(1, parseInt(searchParams?.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let articles = null
  let count = 0
  let profileMap: Record<string, { username: string; display_name: string; avatar_url: string | null }> = {}
  try {
    const result = await supabase
      .from('opinion_articles')
      .select('id, title, slug, excerpt, cover_image_url, published_at, author_id', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)
    articles = result.data
    count = result.count ?? 0
    if (result.error) {
      console.error('[opinions/page] Error:', result.error.message)
    }

    if (articles && articles.length > 0) {
      const authorIds = Array.from(new Set(articles.map((a) => a.author_id).filter(Boolean)))
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds)
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url }
        }
      }
    }
  } catch (err) {
    console.error('[opinions/page] Query exception:', err)
  }

  const items = (articles ?? []).map((a) => {
    const profile = profileMap[a.author_id] ?? null
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      cover_image_url: a.cover_image_url,
      published_at: a.published_at,
      like_count: 0,
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? 'Penulis',
      avatar_url: profile?.avatar_url ?? null,
    }
  })

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1
  const hasNext = page < totalPages

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
            Opinions
          </p>
          <h1 className="font-libre text-3xl font-bold text-primary-dark leading-tight">
            Perspektif dari pembaca Saintifiks
          </h1>
          <p className="font-helvetica text-sm text-primary-dark/50 mt-3">
            Artikel-artikel ini adalah pendapat pribadi penulisnya, bukan posisi redaksi.
          </p>
        </div>

        {/* Daftar artikel */}
        {items.length === 0 ? (
          <div className="py-20 text-center border border-primary-dark/10">
            <p className="font-helvetica text-sm text-primary-dark/40">
              Belum ada artikel opinions yang diterbitkan.
            </p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <OpinionCard
                key={item.id}
                title={item.title}
                slug={item.slug}
                username={item.username}
                displayName={item.display_name}
                avatarUrl={item.avatar_url}
                excerpt={item.excerpt}
                coverImageUrl={item.cover_image_url}
                publishedAt={item.published_at!}
                likeCount={item.like_count}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || hasNext) && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-primary-dark/10">
            {page > 1 ? (
              <Link
                href={`/opinions?page=${page - 1}`}
                className="font-helvetica text-sm text-primary-dark hover:opacity-60 transition-opacity duration-150"
              >
                ← Lebih baru
              </Link>
            ) : <span />}

            {hasNext && (
              <Link
                href={`/opinions?page=${page + 1}`}
                className="font-helvetica text-sm text-primary-dark hover:opacity-60 transition-opacity duration-150"
              >
                Lebih lama →
              </Link>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
