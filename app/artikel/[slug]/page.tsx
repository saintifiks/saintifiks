// [PERBAIKAN V2] — Update ke Design System V2

import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'
import StudioRenderer from '@/components/editorial-studio/StudioRenderer'
import ArticleView from '@/components/artikel/ArticleView'
import {
  migrateStudioDocument,
  validateStudioDocumentV2,
  type StudioVersionedDocument,
} from '@/lib/editorial-studio/document'

// [STABIL] Fitur social interaction sudah berjalan, hemat quota with cache 1 jam
// Note: Koreksi dan interaksi (like/share/comment) tetap real-time via Client Components
// Cache 10 menit (ISR). Terbit/ubah/tarik lewat dashboard menyegarkan segera (revalidatePublicContent);
// koreksi yang disetujui langsung di basis data muncul paling lambat dalam 10 menit.
export const revalidate = 600

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

// Artikel terbit dirender saat build/deploy (langsung siap di cache); artikel baru dirender saat pertama diminta
// lalu di-cache (dynamicParams default true). Bila basis data tak terjangkau saat build, cukup kembalikan daftar kosong.
export async function generateStaticParams() {
  try {
    const { data } = await createPublicClient()
      .from('articles')
      .select('slug')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(100)
    return (data ?? []).map((a) => ({ slug: a.slug as string }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()

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
  const supabase = createPublicClient()

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
  let studioDocument: StudioVersionedDocument | null = null
  const { data: publication } = await supabase
    .from('editorial_studio_publications')
    .select('snapshot_id')
    .eq('article_id', artikel.id)
    .maybeSingle()
  if (publication?.snapshot_id) {
    const { data: snapshot } = await supabase
      .from('editorial_studio_published_snapshots')
      .select('content')
      .eq('id', publication.snapshot_id)
      .maybeSingle()
    const v2Document = validateStudioDocumentV2(snapshot?.content)
    if (v2Document.ok) {
      studioDocument = v2Document.document
    } else {
      const migrated = migrateStudioDocument(snapshot?.content)
      if (migrated.ok) studioDocument = migrated.document
    }
  }

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

  // Waktu baca ~200 kata/menit, dihitung dari isi artikel.
  const jumlahKata = (artikel.content ?? '').trim().split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(jumlahKata / 200))

  return (
    <ArticleView article={artikel} readingMinutes={readingMinutes} corrections={corrections}>
      {studioDocument
        ? <StudioRenderer document={studioDocument} />
        : <ArticleRenderer content={artikel.content} charts={charts} />}
    </ArticleView>
  )
}
