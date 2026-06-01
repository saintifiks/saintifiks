// Halaman beranda — NYT-style layout dengan SubHeader, Hero, Article Cards, Section Dividers
// Server Component: data di-fetch di server

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubHeader from '@/components/layout/SubHeader'
import OpinionCard from '@/components/opinions/OpinionCard'

// ISR: Next.js meng-cache halaman ini dan memperbarui otomatis setiap 5 menit
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Saintifiks',
  description: 'Mereka punya narasi, kami punya angka.',
  openGraph: {
    title: 'Saintifiks',
    description: 'Mereka punya narasi, kami punya angka.',
    url: '/',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Saintifiks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saintifiks',
    description: 'Mereka punya narasi, kami punya angka.',
  },
}

// Tipe data
type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
}

type OpinionItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string
  like_count: number
  username: string
  display_name: string
  avatar_url: string | null
}

// Helper: Format tanggal Indonesia
function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Helper: Estimate read time (200 wpm)
function estimateReadTime(text: string | null): string {
  if (!text) return '2 min read'
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}

export default async function BerandaPage() {
  const supabase = await createClient()

  // Fetch paralel: artikel editorial + artikel opinions
  const [{ data: articles, error: errArticles }, { data: opinions, error: errOpinions }] =
    await Promise.all([
      supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image_url, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
      supabase
        .from('opinion_articles')
        .select('id, title, slug, excerpt, cover_image_url, published_at, author_id')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6),
    ])

  if (errArticles) console.error('[Beranda] Gagal mengambil artikel:', errArticles.message)
  if (errOpinions) console.error('[Beranda] Gagal mengambil opinions:', errOpinions.message)

  const daftarArtikel: Article[] = articles ?? []
  const featuredArticle = daftarArtikel[0]
  const remainingArticles = daftarArtikel.slice(1)

  // Fetch profil penulis opinions
  const opinionProfileMap: Record<string, { username: string; display_name: string; avatar_url: string | null }> = {}
  if (opinions && opinions.length > 0) {
    const authorIds = Array.from(new Set(opinions.map((a) => a.author_id).filter(Boolean)))
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url')
      .in('user_id', authorIds)
    if (profiles) {
      for (const p of profiles) {
        opinionProfileMap[p.user_id] = { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url }
      }
    }
  }

  const daftarOpinions: OpinionItem[] = (opinions ?? []).map((a) => {
    const profile = opinionProfileMap[a.author_id] ?? null
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? null,
      cover_image_url: a.cover_image_url ?? null,
      published_at: a.published_at as string,
      like_count: 0,
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? 'Penulis',
      avatar_url: profile?.avatar_url ?? null,
    }
  })

  return (
    <main className="min-h-screen bg-paper dark:bg-night pb-16">
      {/* SubHeader: Tanggal + metadata */}
      <SubHeader />

      {/* ===== HERO SECTION ===== */}
      {featuredArticle && (
        <section className="px-4 sm:px-6 pt-6 pb-8">
          <div className="max-w-2xl mx-auto">
            {/* Kicker */}
            <div className="mb-3">
              <span className="font-mono text-kicker text-sea-deep uppercase tracking-wider border-b-2 border-sea-deep pb-0.5">
                Sorotan
              </span>
            </div>

            {/* Featured Article */}
            <article className="group cursor-pointer">
              <Link href={`/artikel/${featuredArticle.slug}`}>
                <h2 className="font-display text-display-sm sm:text-display-base font-bold text-ink dark:text-paper mb-3 leading-tight group-hover:text-sea-deep transition-colors duration-150">
                  {featuredArticle.title}
                </h2>

                {featuredArticle.excerpt && (
                  <p className="font-body text-body-lg text-warm-gray dark:text-warm-gray mb-4 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 mb-4">
                  {featuredArticle.published_at && (
                    <span className="font-mono text-meta text-warm-gray uppercase">
                      {formatTanggal(featuredArticle.published_at)}
                    </span>
                  )}
                  <span className="font-mono text-meta text-warm-gray">
                    {estimateReadTime(featuredArticle.excerpt)}
                  </span>
                </div>

                {/* Hero Image (jika ada) */}
                {featuredArticle.cover_image_url && (
                  <div className="w-full aspect-[16/9] bg-ink/5 dark:bg-paper/5 overflow-hidden mb-4">
                    <img
                      src={featuredArticle.cover_image_url}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
              </Link>
            </article>
          </div>
        </section>
      )}

      {/* ===== EDITORIAL ARTICLES LIST ===== */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {remainingArticles.length > 0 ? (
            <div className="space-y-0">
              {remainingArticles.map((artikel) => (
                <article
                  key={artikel.id}
                  className="rule-light py-6 last:border-b-0 group"
                >
                  <Link href={`/artikel/${artikel.slug}`} className="block">
                    {/* Kicker placeholder - bisa diextend untuk kategori */}
                    <span className="font-mono text-kicker text-warm-gray uppercase mb-2 block">
                      Editorial
                    </span>

                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink dark:text-paper mb-2 group-hover:text-sea-deep transition-colors duration-150 leading-tight">
                      {artikel.title}
                    </h3>

                    {artikel.excerpt && (
                      <p className="font-body text-body-base text-warm-gray dark:text-warm-gray mb-3 line-clamp-2">
                        {artikel.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      {artikel.published_at && (
                        <span className="font-mono text-meta text-warm-gray">
                          {formatTanggal(artikel.published_at)}
                        </span>
                      )}
                      <span className="font-mono text-meta text-warm-gray">
                        {estimateReadTime(artikel.excerpt)}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : daftarArtikel.length === 0 && (
            <p className="font-interface text-sm text-warm-gray py-8">
              Belum ada artikel yang dipublikasikan.
            </p>
          )}
        </div>
      </section>

      {/* ===== SECTION DIVIDER: OPINIONS ===== */}
      {daftarOpinions.length > 0 && (
        <section className="px-4 sm:px-6 mt-10">
          <div className="max-w-2xl mx-auto">
            {/* Heavy rule divider dengan italic heading */}
            <div className="border-b-4 border-ink dark:border-paper mb-6">
              <h2 className="font-display text-2xl sm:text-3xl italic text-ink dark:text-paper py-2">
                Opinions
              </h2>
            </div>

            {/* Opinions grid */}
            <div className="space-y-6">
              {daftarOpinions.map((item) => (
                <OpinionCard
                  key={item.id}
                  title={item.title}
                  slug={item.slug}
                  username={item.username}
                  displayName={item.display_name}
                  avatarUrl={item.avatar_url}
                  excerpt={item.excerpt}
                  coverImageUrl={item.cover_image_url}
                  publishedAt={item.published_at}
                  likeCount={item.like_count}
                />
              ))}
            </div>

            {/* Link ke semua opinions */}
            <div className="mt-8 pt-6 border-t border-ink/10 dark:border-paper/10 text-center">
              <Link
                href="/opinions"
                className="font-mono text-kicker text-warm-gray hover:text-ink dark:hover:text-paper transition-colors duration-150 uppercase tracking-widest"
              >
                Semua opinions →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Empty state untuk opinions */}
      {daftarOpinions.length === 0 && (
        <section className="px-4 sm:px-6 mt-10">
          <div className="max-w-2xl mx-auto">
            <div className="border-b-4 border-ink dark:border-paper mb-6">
              <h2 className="font-display text-2xl sm:text-3xl italic text-ink dark:text-paper py-2">
                Opinions
              </h2>
            </div>
            <div className="py-12 text-center">
              <p className="font-interface text-sm text-warm-gray">
                Belum ada artikel opinions yang diterbitkan.
              </p>
              <Link
                href="/akun/tulis"
                className="font-interface text-sm text-sea-deep hover:opacity-70 transition-opacity duration-150 mt-4 inline-block"
              >
                Tulis artikel pertama →
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}