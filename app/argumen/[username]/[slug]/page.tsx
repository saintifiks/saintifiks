// Halaman artikel opinions individual — Server Component
// Tidak di-cache (status artikel bisa berubah kapan saja)

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import OpinionContentRenderer from '@/components/opinions/OpinionContentRenderer'
import StudioRenderer from '@/components/editorial-studio/StudioRenderer'
import { publishedOpinionDocument } from '@/lib/opinions/studio-document'
import ArgumenView from '@/components/opinions/ArgumenView'
import OpinionAnalyticsTracker from '@/components/opinions/OpinionAnalyticsTracker'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, display_name')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) return { title: 'Argumen — Saintifiks' }

  const { data: article } = await supabase
    .from('opinion_articles')
    .select('title, excerpt')
    .eq('author_id', profile.user_id)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!article) return { title: 'Argumen — Saintifiks' }

  return {
    title: `${article.title} — Argumen Saintifiks`,
    description: article.excerpt ?? `Tulisan Argumen oleh ${profile.display_name} di Saintifiks.`,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      siteName: 'Saintifiks',
    },
  }
}

export default async function OpinionArticlePage(props: PageProps) {
  const params = await props.params;
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
    .select('id, title, content, studio_document, excerpt, cover_image_url, published_at, status')
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

  // Tulisan yang ditulis dengan editor Studio dirender seperti artikel redaksi; tulisan lama (Markdown) tetap
  // lewat penampil lama.
  const studioDocument = publishedOpinionDocument(article.studio_document)

  return (
    <>
      <OpinionAnalyticsTracker articleId={article.id} />
      <ArgumenView article={{ ...article, slug: params.slug }} author={profile} corrections={corrections ?? []}>
        {studioDocument
          ? <StudioRenderer document={studioDocument} />
          : <OpinionContentRenderer content={article.content} charts={charts ?? []} />}
      </ArgumenView>
    </>
  )
}
