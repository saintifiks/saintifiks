// Halaman beranda — daftar artikel editorial Saintifiks (redesain Sesi #47).
// Server Component: data di-fetch di server. Tampilan & filter (cari + lokasi)
// ditangani komponen klien HomeFeed.

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HomeFeed, { type FeedArticle } from '@/components/layout/HomeFeed'

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

// Estimasi waktu baca dari jumlah kata isi artikel (~200 kata/menit).
function hitungMenitBaca(content: string | null): number {
  if (!content) return 1
  const jumlahKata = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(jumlahKata / 200))
}

export default async function BerandaPage() {
  const supabase = await createClient()

  // Kolom category/kicker/country ditambahkan pada migration Sesi #47.
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, category, kicker, country, content, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) console.error('[Beranda] Gagal mengambil artikel:', error.message)

  const daftarArtikel: FeedArticle[] = (articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? null,
    coverImageUrl: a.cover_image_url ?? null,
    category: a.category ?? null,
    kicker: a.kicker ?? null,
    country: a.country ?? null,
    readingMinutes: hitungMenitBaca(a.content ?? null),
    publishedAt: a.published_at ?? null,
  }))

  return <HomeFeed articles={daftarArtikel} />
}
