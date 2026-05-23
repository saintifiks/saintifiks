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
      <div className="border-b border-primary-dark/10">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setActiveTab('redaksi')}
              className={`font-helvetica text-sm uppercase tracking-widest px-8 py-4 border-b-2 transition-all duration-150 ${
                activeTab === 'redaksi'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-primary-dark/40 hover:text-primary-dark/70'
              }`}
            >
              Saintifiks
            </button>
            <button
              onClick={() => setActiveTab('opinions')}
              className={`font-helvetica text-sm uppercase tracking-widest px-8 py-4 border-b-2 transition-all duration-150 ${
                activeTab === 'opinions'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-primary-dark/40 hover:text-primary-dark/70'
              }`}
            >
              Opinions
            </button>
          </div>
        </div>
      </div>

      {/* Konten tab Saintifiks */}
      {activeTab === 'redaksi' && (
        <section className="max-w-2xl mx-auto px-6 py-12">
          {articles.length === 0 ? (
            <p className="font-helvetica text-sm text-primary-dark/40">
              Belum ada artikel yang dipublikasikan.
            </p>
          ) : (
            <ul className="divide-y divide-primary-dark/10">
              {articles.map((artikel) => (
                <li key={artikel.id} className="py-10">
                  <a href={`/artikel/${artikel.slug}`} className="group block">
                    {artikel.published_at && (
                      <time
                        dateTime={artikel.published_at}
                        className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest"
                      >
                        {formatTanggal(artikel.published_at)}
                      </time>
                    )}
                    <h2 className="font-libre text-2xl font-bold text-primary-dark mt-2 group-hover:opacity-60 transition-opacity duration-150">
                      {artikel.title}
                    </h2>
                    {artikel.excerpt && (
                      <p className="font-helvetica text-base text-primary-dark/70 mt-2 leading-relaxed">
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
        <section className="max-w-2xl mx-auto px-6 py-12">
          {opinions.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-helvetica text-sm text-primary-dark/40">
                Belum ada artikel opinions yang diterbitkan.
              </p>
              <Link
                href="/akun/tulis"
                className="font-helvetica text-sm text-accent-blue hover:opacity-70 transition-opacity duration-150 mt-4 inline-block"
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
              <div className="mt-8 pt-6 border-t border-primary-dark/10 text-center">
                <Link
                  href="/opinions"
                  className="font-helvetica text-sm text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 uppercase tracking-widest"
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
