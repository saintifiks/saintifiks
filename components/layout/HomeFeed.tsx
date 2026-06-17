'use client'

// HomeFeed — daftar artikel editorial di Halaman Utama (redesain Sesi #47, V3 Sesi #49).
// Terdiri dari: search bar (cari artikel) + daftar ArticleCard.
// Filter: pencarian judul/ringkasan + relevansi lokasi (dari Drawer/LocationProvider).

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useLocationSelection, GLOBAL } from '@/components/layout/LocationProvider'
import ArticleCard, { type ArticleCardData } from '@/components/feed/ArticleCard'
import { Input } from '@/components/ui'

export type FeedArticle = ArticleCardData & {
  country: string | null
  publishedAt: string | null
}

export default function HomeFeed({ articles }: { articles: FeedArticle[] }) {
  const [query, setQuery] = useState('')
  const { selected } = useLocationSelection()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      const lokasiCocok =
        selected === GLOBAL || !a.country || a.country === selected
      if (!lokasiCocok) return false

      if (!q) return true
      const haystack = `${a.title} ${a.excerpt ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [articles, query, selected])

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-16">
        {/* === SEARCH BAR === */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel..."
              aria-label="Cari artikel"
              className="flex-1 font-display text-xl font-bold border-0 border-b-2 border-warm-gray focus:border-warm-gray placeholder:text-warm-gray placeholder:font-bold"
            />
            <Search
              size={22}
              strokeWidth={2}
              className="shrink-0 text-text-secondary"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* === DAFTAR ARTICLE-CARD === */}
        {filtered.length === 0 ? (
          <p className="font-interface text-body-sm text-text-secondary mt-8">
            {articles.length === 0
              ? 'Belum ada artikel yang dipublikasikan.'
              : 'Tidak ada artikel yang cocok dengan pencarian atau lokasi ini.'}
          </p>
        ) : (
          <div className="mt-6 space-y-0">
            {filtered.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                showDivider={i < filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
