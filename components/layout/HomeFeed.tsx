'use client'

// HomeFeed — daftar artikel editorial di Halaman Utama (redesain Sesi #47).
// Terdiri dari: search bar (cari artikel) + daftar article-card dipisah divider.
// Filter: pencarian judul/ringkasan + relevansi lokasi (dari Drawer/LocationProvider).

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useLocationSelection, GLOBAL } from '@/components/layout/LocationProvider'

export type FeedArticle = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  category: string | null
  kicker: string | null
  country: string | null
  readingMinutes: number
  publishedAt: string | null
}

export default function HomeFeed({ articles }: { articles: FeedArticle[] }) {
  const [query, setQuery] = useState('')
  const { selected } = useLocationSelection()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      // Filter lokasi: 'Global' → semua. Selain itu → artikel negara terpilih
      // atau artikel tanpa label negara (dianggap berlaku umum/global).
      const lokasiCocok =
        selected === GLOBAL || !a.country || a.country === selected
      if (!lokasiCocok) return false

      if (!q) return true
      const haystack = `${a.title} ${a.excerpt ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [articles, query, selected])

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-16">

        {/* === SEARCH BAR (cari-artikel) === */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel..."
              aria-label="Cari artikel"
              className="flex-1 bg-transparent font-display text-[20px] font-bold text-ink placeholder:text-warm-gray placeholder:font-bold focus:outline-none"
            />
            <Search size={22} strokeWidth={2} className="shrink-0 text-warm-gray" aria-hidden="true" />
          </div>
          {/* Garis search bar — 2px, warm-gray, gap 8px dari teks */}
          <div className="mt-2 h-[2px] w-full bg-warm-gray" />
        </div>

        {/* === DAFTAR ARTICLE-CARD === */}
        {filtered.length === 0 ? (
          <p className="font-interface text-body-sm text-warm-gray mt-8">
            {articles.length === 0
              ? 'Belum ada artikel yang dipublikasikan.'
              : 'Tidak ada artikel yang cocok dengan pencarian atau lokasi ini.'}
          </p>
        ) : (
          <div className="mt-6">
            {filtered.map((article, i) => (
              <div key={article.id}>
                <ArticleCard article={article} />
                {/* Divider antar kartu: 2px, warm-gray, jarak 16px atas-bawah */}
                {i < filtered.length - 1 && (
                  <div className="my-4 h-[2px] w-full bg-warm-gray" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ArticleCard({ article }: { article: FeedArticle }) {
  return (
    <Link href={`/artikel/${article.slug}`} className="group block">
      {/* Cover — full, tidak terpotong, dinamis mengikuti lebar layar */}
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-full h-auto"
          loading="lazy"
        />
      )}

      {/* Kategori-konten | kicker — gap 16px dari cover (atau dari atas kartu) */}
      {(article.category || article.kicker) && (
        <div className={`flex items-center ${article.coverImageUrl ? 'mt-4' : ''}`}>
          {article.category && (
            <span className="font-interface text-[14px] font-semibold text-sea-deep">
              {article.category}
            </span>
          )}
          {article.category && article.kicker && (
            <span className="mx-2 inline-block h-4 w-px bg-warm-gray" aria-hidden="true" />
          )}
          {article.kicker && (
            <span className="font-interface text-[14px] font-semibold text-ink">
              {article.kicker}
            </span>
          )}
        </div>
      )}

      {/* Judul — Libre Baskerville Medium 24px */}
      <h2 className="font-display text-[24px] font-medium leading-snug text-ink mt-2 group-hover:text-sea-deep transition-colors duration-150">
        {article.title}
      </h2>

      {/* Ringkasan — Libre Baskerville Regular 16px */}
      {article.excerpt && (
        <p className="font-display text-[16px] font-normal leading-relaxed text-ink mt-2">
          {article.excerpt}
        </p>
      )}

      {/* Waktu baca — gap 16px dari ringkasan */}
      <p className="font-interface text-[13px] text-warm-gray mt-4">
        baca {article.readingMinutes} menit
      </p>
    </Link>
  )
}
