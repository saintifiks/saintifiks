'use client'

import Link from 'next/link'
import { useState } from 'react'
import OpinionCard from '@/components/opinions/OpinionCard'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
}

type OpinionItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string
  like_count: number
  username: string
  display_name: string
  avatar_url: string | null
}

type Props = {
  articles: Article[]
  opinions: OpinionItem[]
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function HomepageTabs({ articles, opinions }: Props) {
  const [activeTab, setActiveTab] = useState<'redaksi' | 'opinions'>('redaksi')

  return (
    <>
      {/* Tab navigation — statis, ikut scroll ke atas bersama header */}
      <div className="border-b border-ink/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setActiveTab('redaksi')}
              className={`font-mono text-kicker uppercase px-4 sm:px-8 py-3 sm:py-4 border-b-2 transition-all duration-150 ${
                activeTab === 'redaksi'
                  ? 'border-ink text-ink'
                  : 'border-transparent text-warm-gray hover:text-ink'
              }`}
            >
              Saintifiks
            </button>
            <button
              onClick={() => setActiveTab('opinions')}
              className={`font-mono text-kicker uppercase px-4 sm:px-8 py-3 sm:py-4 border-b-2 transition-all duration-150 ${
                activeTab === 'opinions'
                  ? 'border-ink text-ink'
                  : 'border-transparent text-warm-gray hover:text-ink'
              }`}
            >
              Opinions
            </button>
          </div>
        </div>
      </div>

      {/* Konten tab Saintifiks */}
      {activeTab === 'redaksi' && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {articles.length === 0 ? (
            <p className="font-interface text-sm text-warm-gray">
              Belum ada artikel yang dipublikasikan.
            </p>
          ) : (
            <ul>
              {articles.map((artikel) => (
                <li key={artikel.id} className="py-6 border-b border-ink/10 last:border-b-0">
                  <a href={`/artikel/${artikel.slug}`} className="group block">
                    {artikel.published_at && (
                      <time
                        dateTime={artikel.published_at}
                        className="font-interface text-meta text-warm-gray"
                      >
                        {formatTanggal(artikel.published_at)}
                      </time>
                    )}
                    <h2 className="font-display text-[26px] sm:text-display-sm font-bold text-ink mt-2 group-hover:text-sea-deep transition-colors duration-[120ms]">
                      {artikel.title}
                    </h2>
                    {artikel.excerpt && (
                      <p className="font-body text-body-base text-warm-gray mt-1.5 sm:mt-2 line-clamp-2">
                        {artikel.excerpt}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Konten tab Opinions */}
      {activeTab === 'opinions' && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {opinions.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-interface text-sm text-warm-gray">
                Belum ada artikel opinions yang diterbitkan.
              </p>
              <Link
                href="/akun/tulis"
                className="font-interface text-sm text-sea-deep hover:opacity-70 transition-opacity duration-150 mt-4 inline-block"
              >
                Tulis artikel pertama →
              </Link>
            </div>
          ) : (
            <div>
              {opinions.map((item) => (
                <OpinionCard
                  key={item.id}
                  title={item.title}
                  slug={item.slug}
                  username={item.username}
                  displayName={item.display_name}
                  avatarUrl={item.avatar_url}
                  excerpt={item.excerpt}
                  coverImageUrl={item.cover_image_url}
                  publishedAt={item.published_at}
                  likeCount={item.like_count}
                />
              ))}
              <div className="mt-8 pt-6 border-t border-ink/10 text-center">
                <Link
                  href="/opinions"
                  className="font-mono text-kicker text-warm-gray hover:text-ink transition-colors duration-150 uppercase tracking-widest"
                >
                  Semua opinions →
                </Link>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}