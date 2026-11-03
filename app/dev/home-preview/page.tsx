// Pratinjau Beranda dengan data contoh (salinan artikel yang sudah terbit) — tanpa database.
// Hanya lokal dan preview Vercel; 404 di produksi. Parameter ?gambar=1 memberi semua berita sampul
// untuk memeriksa tata letak saat gambar lengkap; ?sedikit=1 hanya menampilkan 2 berita.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HomeFeed, { type FeedArticle } from '@/components/layout/HomeFeed'
import { formatTanggalPanjang } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Pratinjau Beranda', robots: { index: false, follow: false } }

const COVERS = [
  'https://efkolgdeddpnpzgcnclo.supabase.co/storage/v1/object/public/artikel-gambar/1779266136537-pesta-babi.png',
  'https://efkolgdeddpnpzgcnclo.supabase.co/storage/v1/object/public/artikel-gambar/1779342347021-mbg.webp',
]

const base: Omit<FeedArticle, 'coverImageUrl'>[] = [
  { id: '1', slug: 'pesta-babi', title: 'Pesta Babi — Negara yang Melanggar Aturannya Sendiri', excerpt: 'Tentang Film Pesta Babi, PSN Papua, dan Dua Masalah yang Berakar dari Tempat yang Sama', category: null, kicker: null, country: null, readingMinutes: 16, publishedAt: '2026-05-22T07:35:48Z' },
  { id: '2', slug: 'mbg', title: 'MBG Tepat Sasaran. Tapi Sasarannya yang Salah', excerpt: 'Program makan sekolah terbukti membantu anak hadir di sekolah, bukan membalikkan stunting yang sudah terkonsolidasi sejak sebelum anak itu duduk di kelas satu.', category: null, kicker: null, country: null, readingMinutes: 8, publishedAt: '2026-05-21T18:24:50Z' },
  { id: '3', slug: 'gatot', title: 'Gatot Tuduh Jokowi Campuri Promosi TNI. Mengapa Tidak Ada yang Berani Merespons?', excerpt: 'Pernyataan Gatot Nurmantyo tentang intervensi pangkat di tubuh TNI ramai dibicarakan. Bukan klaimnya yang paling menarik — melainkan sunyi yang mengikutinya.', category: null, kicker: null, country: null, readingMinutes: 7, publishedAt: '2026-05-21T17:49:45Z' },
  { id: '4', slug: 'korupsi', title: 'Korupsi adalah pilihan rasional di Indonesia', excerpt: 'Koruptor membuat keputusan yang masuk akal di dalam sistem yang menjadikan korupsi sebagai satu-satunya cara bertahan.', category: null, kicker: null, country: null, readingMinutes: 9, publishedAt: '2026-05-21T07:53:30Z' },
  { id: '5', slug: 'minyak', title: 'Negara yang Membeli Minyaknya Sendiri', excerpt: 'Indonesia duduk di atas 128 cekungan hidrokarbon. Hanya 16 persen yang pernah dieksplorasi. Tagihan atas kelalaian dua dekade itu kini jatuh tempo — dan diserahkan ke Moskow.', category: null, kicker: null, country: null, readingMinutes: 8, publishedAt: '2026-05-21T07:41:57Z' },
  { id: '6', slug: 'energi', title: 'Kedaulatan Energi di Atas Kertas, Defisit di Neraca', excerpt: 'Pemerintah menjanjikan penghematan Rp157 triliun dari penghentian impor solar. Data menunjukkan angka itu bisa dikalahkan oleh nilai ekspor CPO yang dikorbankan.', category: null, kicker: null, country: null, readingMinutes: 9, publishedAt: '2026-05-21T05:58:53Z' },
]

export default async function HomePreviewPage(props: { searchParams: Promise<{ gambar?: string; sedikit?: string; label?: string }> }) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const sp = await props.searchParams

  let articles: FeedArticle[] = base.map((a, i) => ({
    ...a,
    // Data asli: hanya dua berita pertama bergambar. ?gambar=1 memberi semuanya.
    coverImageUrl: sp.gambar ? COVERS[i % 2] : i < 2 ? COVERS[i] : null,
    category: sp.label ? (i % 2 ? 'Ekonomi' : 'Politik') : a.category,
    kicker: sp.label && i % 3 === 0 ? 'Utang negara' : a.kicker,
  }))
  if (sp.sedikit) articles = articles.slice(0, 2)

  return <HomeFeed articles={articles} dateLabel={formatTanggalPanjang()} />
}
