// ArgumenView — tata letak halaman tulisan Argumen (Server Component). Dipakai halaman tulisan dan pratinjau desain.
// Rangka sama dengan ArticleView: kolom baca 720px, judul, ringkasan miring, metadata mono, rel aksi di kiri
// (desktop) atau bilah dasar (ponsel). Bedanya: catatan "pendapat penulis", byline penulis, dan tombol Laporkan.

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui'
import ReadingProgress from '@/components/artikel/ReadingProgress'
import ArticleInteractions from '@/components/artikel/ArticleInteractions'
import ArgumenByline from './ArgumenByline'
import ArgumenNote from './ArgumenNote'

export type ArgumenViewData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
}

type Correction = {
  id: string
  original_text: string
  corrected_text: string
  explanation: string | null
  created_at: string
}

export default function ArgumenView({
  article,
  author,
  corrections,
  children,
}: {
  article: ArgumenViewData
  author: { username: string; display_name: string; avatar_url: string | null }
  corrections: Correction[]
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-paper">
      <ReadingProgress />

      <div className="relative mx-auto max-w-[720px] px-4 pb-28 pt-8 md:px-0 md:pt-12 xl:pb-24">
        <header>
          <Badge variant="kicker">Argumen</Badge>
          <h1 className="mt-5 font-display text-display-sm leading-[1.12] tracking-[-0.01em] text-text-primary md:text-display-base">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-5 font-display text-body-sm italic leading-relaxed text-text-secondary sm:text-body-base">
              {article.excerpt}
            </p>
          )}
          <ArgumenByline
            username={author.username}
            displayName={author.display_name}
            avatarUrl={author.avatar_url}
            publishedAt={article.published_at}
            className="mt-6"
          />
        </header>

        <ArgumenNote className="mt-8" />

        {article.cover_image_url && (
          <figure className="-mx-4 mt-8 md:mx-0 md:mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image_url} alt={article.title} className="h-auto w-full object-cover" fetchPriority="high" />
          </figure>
        )}

        <article className="mt-10">{children}</article>

        <ArticleInteractions
          kind="opinion"
          articleId={article.id}
          articleTitle={article.title}
          articleExcerpt={article.excerpt}
          articleSlug={article.slug}
          corrections={corrections}
        />
      </div>
    </main>
  )
}
