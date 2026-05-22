// [PERUBAHAN SESI #28] — Tambah ShareButton, CommentsSection, dan tata ulang layout interaksi

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'
import ArticleInteractions from '@/components/artikel/ArticleInteractions'

// [PERUBAHAN SESI #28] — Pakai dynamic rendering saat testing fitur baru
// Setelah stabil, bisa kembalikan ke revalidate = 60 atau 3600
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const dynamicParams = true

// [PERBAIKAN SESI #15]
// Tipe article_corrections diperbarui: tambah kolom 'status' untuk filter approved
// [PERBAIKAN SESI #16]
// Tipe article_charts diperbarui: config bisa string | object karena Supabase JSONB
// auto-deserialize menjadi object, bukan selalu string
type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  article_charts: { chart_identifier: string; config: string | object }[]
  article_corrections: {
    id: string
    original_text: string
    corrected_text: string
    explanation: string | null
    created_at: string
    status: string
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
      article_corrections (
        id,
        original_text,
        corrected_text,
        explanation,
        created_at,
        status
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  // [PERBAIKAN SESI #15]
  // Sebelumnya: article_corrections!inner — INNER JOIN yang menyebabkan query
  // mengembalikan null jika artikel belum punya koreksi → notFound() → 404.
  // Sekarang: article_corrections biasa (LEFT JOIN) — artikel selalu dikembalikan
  // terlepas dari ada tidaknya koreksi.

  if (error || !article) {
    notFound()
  }

  const artikel = article as Article
  const charts = artikel.article_charts || []

  // [PERBAIKAN SESI #15]
  // Hanya tampilkan koreksi yang sudah disetujui admin (status = 'approved').
  // Ini memastikan koreksi pending/rejected tidak bocor ke halaman publik,
  // terlepas dari kondisi RLS policy di Supabase.
  // Map eksplisit digunakan (bukan destructuring) agar ESLint tidak komplain
  // tentang variabel 'status' yang tidak diteruskan ke komponen.
  const corrections = (artikel.article_corrections || [])
    .filter((c) => c.status === 'approved')
    .map((c) => ({
      id: c.id,
      original_text: c.original_text,
      corrected_text: c.corrected_text,
      explanation: c.explanation,
      created_at: c.created_at,
    }))

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
        
        {/* Section Interaksi — Client Component wrapper untuk menghindari cache */}
        <ArticleInteractions
          articleId={artikel.id}
          articleTitle={artikel.title}
          articleExcerpt={artikel.excerpt}
          articleSlug={artikel.slug}
          corrections={corrections}
        />
      </article>
    </main>
  )
}
