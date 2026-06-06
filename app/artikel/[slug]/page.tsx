// [PERBAIKAN V2] — Update ke Design System V2

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'
import ArticleInteractions from '@/components/artikel/ArticleInteractions'
import ReadingProgress from '@/components/artikel/ReadingProgress'
import BylineBlock from '@/components/artikel/BylineBlock'
import { Badge } from '@/components/ui'

// [STABIL] Fitur social interaction sudah berjalan, hemat quota with cache 1 jam
// Note: Koreksi dan interaksi (like/share/comment) tetap real-time via Client Components
export const revalidate = 3600  // Cache 1 jam — artikel jarang berubah, quota efisien

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
  category: string | null        // Kategori konten (e.g., "Ekonomi", "Politik")
  kicker: string | null            // Kicker/tagline pendek di atas judul
  cover_illustrator: string | null // Nama illustrator untuk cover caption
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
      category,
      kicker,
      cover_illustrator,
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

  // Helper untuk cek apakah artikel adalah opinion (berdasarkan struktur data)
  // Artikel editorial utama memiliki kicker, opinions tidak wajib kicker
  const hasKicker = !!artikel.kicker
  const hasCategory = !!artikel.category

  return (
    <main className="min-h-screen bg-paper">
      <ReadingProgress />

      {/* ============================================================
          THE-CARD: Blok metadata di paling atas halaman artikel
          Mobile: margin 16px | Desktop: max-width 720px centered
          ============================================================ */}
      <header className="pt-6 pb-0 md:pt-8">
        <div className="px-4 md:px-0 md:max-w-[720px] md:mx-auto">

          {/* 1. KATEGORI-KONTEN & KICKER --------------------------------- */}
          {/* Format: [Kategori] | [Kicker] dengan vertical bar separator */}
          {(hasCategory || hasKicker) && (
            <div className="flex items-center gap-2 mb-2">
              {/* Kategori-konten */}
              {hasCategory && (
                <Badge variant="category" className="text-xl font-semibold">
                  {artikel.category}
                </Badge>
              )}

              {/* Vertical bar separator - hanya tampil jika keduanya ada */}
              {hasCategory && hasKicker && (
                <span className="w-[1px] h-4 bg-ink/30 mx-2" aria-hidden="true" />
              )}

              {/* Kicker */}
              {hasKicker && (
                <span className="font-interface text-[20px] font-semibold text-ink">
                  {artikel.kicker}
                </span>
              )}
            </div>
          )}

          {/* 2. H1 — JUDUL ARTIKEL -------------------------------------- */}
          {/* Libre Baskerville 32px, letter-spacing -1.5%, line-height 1.25 */}
          <h1
            className="font-display text-[32px] font-normal text-ink leading-[1.25] tracking-[-0.015em] mb-2"
            style={{ letterSpacing: '-0.015em' }}
          >
            {artikel.title}
          </h1>

          {/* 3. CAPTION / RINGKASAN ARTIKEL ------------------------------ */}
          {/* Libre Baskerville 14px, muncul jika excerpt ada */}
          {artikel.excerpt && (
            <p className="font-libre text-[14px] font-normal text-ink leading-normal mb-4">
              {artikel.excerpt}
            </p>
          )}
        </div>

        {/* 4. COVER IMAGE --------------------------------------------- */}
        {/* Mobile: 100vw full bleed | Desktop: 720px container width */}
        {artikel.cover_image_url && (
          <div className="mt-4 md:mt-6">
            {/* Mobile: full bleed dengan negative margin */}
            <div className="block md:hidden relative -mx-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artikel.cover_image_url}
                alt={artikel.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Desktop/Tablet: constrained dalam container */}
            <div className="hidden md:block md:max-w-[720px] md:mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artikel.cover_image_url}
                alt={artikel.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}

        {/* 5. COVER CAPTION -------------------------------------------- */}
        {/* Format: ILLUSTRATION : [NAMA ILUSTRATOR] (all caps) */}
        {artikel.cover_illustrator && (
          <div className="px-4 md:px-0 md:max-w-[720px] md:mx-auto mt-4">
            <p
              className="font-interface text-[16px] font-medium text-warm-gray uppercase tracking-[0.12em]"
              style={{ letterSpacing: '0.12em' }}
            >
              ILLUSTRATION : {artikel.cover_illustrator}
            </p>
          </div>
        )}

        {/* 6. DIVIDER -------------------------------------------------- */}
        {/* 2px, #5A5750, gap 32px dari cover caption */}
        <div className="px-4 md:px-0 md:max-w-[720px] md:mx-auto mt-8">
          <hr className="border-0 h-[2px] bg-warm-gray" />
        </div>

        {/* 7. BYLINE — TANGGAL TERBIT -------------------------------- */}
        {artikel.published_at && (
          <div className="px-4 md:px-0 md:max-w-[720px] md:mx-auto mt-2">
            <BylineBlock publishedAt={artikel.published_at} />
          </div>
        )}
      </header>

      {/* ============================================================
          THE-ARTICLE: Isi artikel utama
          Gap dari THE-CARD: 24px
          Max content width: 65ch atau 640px (mana yang lebih sempit)
          ============================================================ */}
      <article className="px-4 md:px-0 md:max-w-[720px] md:mx-auto mt-6 pb-16">
        {/* Content Renderer - body text menggunakan Lora 17px */}
        <ArticleRenderer content={artikel.content} charts={charts} />

        {/* Section Interaksi — Client Component wrapper */}
        <div className="mt-8">
          <ArticleInteractions
            articleId={artikel.id}
            articleTitle={artikel.title}
            articleExcerpt={artikel.excerpt}
            articleSlug={artikel.slug}
            corrections={corrections}
          />
        </div>
      </article>
    </main>
  )
}