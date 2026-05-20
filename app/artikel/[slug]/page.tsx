import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'
import LikeButton from '@/components/artikel/LikeButton'
import CorrectionSection from '@/components/artikel/CorrectionSection'

export const revalidate = 3600

type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  article_charts: { chart_identifier: string; config: string }[]
  article_corrections: {
    id: string
    original_text: string
    corrected_text: string
    explanation: string | null
    created_at: string
  }[]
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image_url, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!article) {
    return { title: 'Artikel tidak ditemukan — Saintifiks' }
  }

  return {
    title: `${article.title} — Saintifiks`,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      siteName: 'Saintifiks',
      url: `/artikel/${article.slug}`,
      type: 'article',
      locale: 'id_ID',
      ...(article.cover_image_url && {
        images: [{ url: article.cover_image_url, alt: article.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt ?? undefined,
      ...(article.cover_image_url && { images: [article.cover_image_url] }),
    },
  }
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ArtikelPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id, 
      title, 
      slug, 
      content, 
      excerpt, 
      cover_image_url, 
      published_at,
      article_charts (
        chart_identifier,
        config
      ),
      article_corrections!inner (
        id,
        original_text,
        corrected_text,
        explanation,
        created_at
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) {
    notFound()
  }

  const artikel = article as Article
  const charts = artikel.article_charts || []
  const corrections = artikel.article_corrections || []

  return (
    <main className="min-h-screen bg-primary-light">
      <header className="border-b border-primary-dark/10 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest hover:text-primary-dark transition-colors duration-150"
          >
            &#8592; Saintifiks
          </Link>

          {artikel.published_at && (
            <time
              dateTime={artikel.published_at}
              className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mt-6"
            >
              {formatTanggal(artikel.published_at)}
            </time>
          )}

          <h1 className="font-libre text-4xl font-bold text-primary-dark mt-3 leading-tight">
            {artikel.title}
          </h1>

          {artikel.excerpt && (
            <p className="font-helvetica text-base text-primary-dark/60 mt-4 leading-relaxed">
              {artikel.excerpt}
            </p>
          )}
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-12">
        <ArticleRenderer content={artikel.content} charts={charts} />
        
        {/* Like Button */}
        <div className="mt-12 pt-8 border-t border-primary-dark/10 flex items-center justify-between">
          <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
            Dukung Jurnalisme Independen
          </p>
          <LikeButton articleId={artikel.id} />
        </div>

        {/* Koreksi Section */}
        <CorrectionSection 
          articleId={artikel.id} 
          corrections={corrections} 
        />
      </article>
    </main>
  )
}