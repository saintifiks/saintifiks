// Halaman artikel opinions individual — Server Component
// Tidak di-cache (status artikel bisa berubah kapan saja)

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import OpinionContentRenderer from '@/components/opinions/OpinionContentRenderer'
import OpinionLabel from '@/components/opinions/OpinionLabel'
import AuthorByline from '@/components/opinions/AuthorByline'
import OpinionLikeButton from '@/components/opinions/OpinionLikeButton'
import ReportButton from '@/components/opinions/ReportButton'
import OpinionAnalyticsTracker from '@/components/opinions/OpinionAnalyticsTracker'
import OpinionShareButton from '@/components/opinions/OpinionShareButton'
import OpinionCorrectionSection from '@/components/opinions/OpinionCorrectionSection'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { username: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, display_name')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) return { title: 'Opinions — Saintifiks' }

  const { data: article } = await supabase
    .from('opinion_articles')
    .select('title, excerpt')
    .eq('author_id', profile.user_id)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!article) return { title: 'Opinions — Saintifiks' }

  return {
    title: `${article.title} — Opinions Saintifiks`,
    description: article.excerpt ?? `Artikel opini oleh ${profile.display_name} di Saintifiks.`,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      siteName: 'Saintifiks',
    },
  }
}

export default async function OpinionArticlePage({ params }: PageProps) {
  const supabase = await createClient()

  // Ambil profil penulis berdasarkan username
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, username, display_name, avatar_url')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) notFound()

  // Ambil artikel berdasarkan author_id + slug
  const { data: article } = await supabase
    .from('opinion_articles')
    .select('id, title, content, excerpt, cover_image_url, published_at, status')
    .eq('author_id', profile.user_id)
    .eq('slug', params.slug)
    .maybeSingle()

  // Tidak ditemukan, atau bukan published → 404
  // (hidden juga 404 — jangan reveal bahwa artikel di-hidden)
  if (!article || article.status !== 'published') notFound()

  // Ambil chart configs untuk artikel ini
  const { data: charts } = await supabase
    .from('opinion_article_charts')
    .select('chart_id, config')
    .eq('opinion_article_id', article.id)

  // Ambil koreksi yang sudah disetujui untuk artikel ini
  const { data: corrections } = await supabase
    .from('opinion_corrections')
    .select('id, original_text, corrected_text, explanation, created_at')
    .eq('opinion_article_id', article.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-primary-light">

      {/* Tracker analytics — Client Component */}
      <OpinionAnalyticsTracker articleId={article.id} />

      <article className="max-w-2xl mx-auto px-6 py-16">

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="mb-10 -mx-6 md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full max-h-96 object-cover border border-primary-dark/10"
            />
          </div>
        )}

        {/* Judul */}
        <h1 className="font-libre text-3xl md:text-4xl font-bold text-primary-dark leading-tight mb-2">
          {article.title}
        </h1>

        {/* Byline penulis */}
        <AuthorByline
          username={profile.username}
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          publishedAt={article.published_at}
        />

        {/* Banner opini */}
        <OpinionLabel />

        {/* Konten artikel */}
        <OpinionContentRenderer
          content={article.content}
          charts={charts ?? []}
        />

        {/* Footer artikel: koreksi rata kiri, like + share + laporan rata kanan */}
        <div className="mt-16 pt-8 border-t border-primary-dark/10 flex items-center justify-between">
          <OpinionCorrectionSection
            articleId={article.id}
            corrections={corrections ?? []}
          />
          <div className="flex items-center gap-2">
            <OpinionLikeButton articleId={article.id} />
            <OpinionShareButton
              articleId={article.id}
              articleTitle={article.title}
              articleExcerpt={article.excerpt}
              articleSlug={params.slug}
              authorDisplayName={profile.display_name}
            />
            <ReportButton articleId={article.id} />
          </div>
        </div>

      </article>
    </main>
  )
}
