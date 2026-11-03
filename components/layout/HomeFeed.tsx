'use client'

// HomeFeed — Beranda: satu berita utama, tiga berita di sisinya, sisanya dalam kolom.
// Pencarian (judul/ringkasan) dan filter lokasi (dari LocationProvider) bekerja di sisi klien.
// Filter lokasi selalu diberi tahu di layar — dulu ia mengubah isi Beranda tanpa penanda.

import { useMemo, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useLocationSelection, GLOBAL } from '@/components/layout/LocationProvider'
import { StoryColumn, StoryLead, StorySide, type StoryData } from '@/components/feed/Story'

export type FeedArticle = StoryData & {
  country: string | null
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
      {children}
    </h2>
  )
}

export default function HomeFeed({ articles, dateLabel }: { articles: FeedArticle[]; dateLabel: string }) {
  const [query, setQuery] = useState('')
  const { selected, setSelected } = useLocationSelection()

  const byLocation = useMemo(
    () => articles.filter((a) => selected === GLOBAL || !a.country || a.country === selected),
    [articles, selected]
  )
  const hiddenByLocation = articles.length - byLocation.length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return byLocation
    return byLocation.filter((a) => `${a.title} ${a.excerpt ?? ''}`.toLowerCase().includes(q))
  }, [byLocation, query])

  const [lead, ...rest] = filtered
  const side = rest.slice(0, 3)
  const more = rest.slice(3)
  // Pemberitahuan hanya tampil bila lokasi benar-benar menyembunyikan artikel.
  const locationFiltered = hiddenByLocation > 0

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
        {/* Baris tanggal dan pencarian */}
        <div className="flex flex-col gap-3 border-b border-border-default/20 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-caption text-text-secondary">{dateLabel}</p>
          <div className="w-full sm:w-72">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel"
              aria-label="Cari artikel"
              className="min-h-[40px] py-1 text-sm"
            />
          </div>
        </div>

        {locationFiltered && (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border-default/15 py-3 font-interface text-caption text-text-secondary">
            <span>
              {hiddenByLocation} artikel dari negara lain disembunyikan. Menampilkan{' '}
              <strong className="font-semibold text-text-primary">{selected}</strong> dan artikel tanpa lokasi.
            </span>
            <Button variant="text" size="sm" onClick={() => setSelected(GLOBAL)}>
              Tampilkan semua
            </Button>
          </p>
        )}

        {!lead ? (
          <div className="py-24">
            <p className="max-w-md font-display text-body-base text-text-secondary">
              {articles.length === 0
                ? 'Belum ada artikel yang diterbitkan.'
                : 'Tidak ada artikel yang cocok dengan pencarian atau lokasi ini.'}
            </p>
            {articles.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                {query && (
                  <Button variant="text" onClick={() => setQuery('')}>
                    Hapus pencarian
                  </Button>
                )}
                {locationFiltered && (
                  <Button variant="text" onClick={() => setSelected(GLOBAL)}>
                    Tampilkan semua lokasi
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Berita utama + sisi */}
            <div className="grid gap-x-0 pt-8 lg:grid-cols-12 lg:pt-10">
              <div className="lg:col-span-7 lg:pr-10">
                <StoryLead story={lead} />
              </div>
              {side.length > 0 && (
                <div className="mt-8 border-t border-border-default/20 pt-6 lg:col-span-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  <SectionTitle>Terbaru</SectionTitle>
                  <div className="divide-y divide-border-default/15">
                    {side.map((story) => (
                      <StorySide key={story.id} story={story} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sisanya */}
            {more.length > 0 && (
              <section className="mt-14 lg:mt-16">
                <SectionTitle>Lainnya</SectionTitle>
                <div className="mt-4 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {more.map((story) => (
                    <StoryColumn key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
