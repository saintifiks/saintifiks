// ArticleView — tata letak halaman artikel (Server Component). Dipakai halaman artikel dan pratinjau desain.
//
// Kolom baca 720px di tengah. Di atas: label (kategori/kicker), judul, ringkasan miring, metadata mono.
// Hierarki dibangun dari ukuran dan miring: judul 32→40px, ringkasan lebih kecil dari judul tetapi lebih
// besar dari metadata (dulu kicker 20px lebih besar daripada ringkasan 14px — terbalik).
// Aksi (suka/komentar/bagikan/koreksi/tampilan baca): rel kiri di desktop, bilah dasar di ponsel.

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui'
import ReadingProgress from './ReadingProgress'
import BylineBlock from './BylineBlock'
import ArticleInteractions from './ArticleInteractions'

export type ArticleViewData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  category: string | null
  kicker: string | null
  cover_illustrator: string | null
}

type Correction = {
  id: string
  original_text: string
  corrected_text: string
  explanation: string | null
  created_at: string
}

export default function ArticleView({
  article,
  readingMinutes,
  corrections,
  children,
}: {
  article: ArticleViewData
  readingMinutes: number
  corrections: Correction[]
  children: ReactNode
}) {
  const hasLabel = !!(article.category || article.kicker)

  return (
    <main className="min-h-screen bg-paper">
      <ReadingProgress />

      <div className="relative mx-auto max-w-[720px] px-4 pb-28 pt-8 md:px-0 md:pt-12 xl:pb-24">
        <header>
          {hasLabel && (
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {article.category && <Badge variant="category">{article.category}</Badge>}
              {article.kicker && (
                <span className="font-interface text-sm font-semibold text-text-primary">{article.kicker}</span>
              )}
            </div>
          )}

          <h1 className="font-display text-display-sm leading-[1.12] tracking-[-0.01em] text-text-primary md:text-display-base">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-5 font-display text-body-sm italic leading-relaxed text-text-secondary sm:text-body-base">
              {article.excerpt}
            </p>
          )}

          <BylineBlock publishedAt={article.published_at} readingMinutes={readingMinutes} className="mt-6" />
        </header>

        {article.cover_image_url && (
          <figure className="-mx-4 mt-8 md:mx-0 md:mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image_url} alt={article.title} className="h-auto w-full object-cover" fetchPriority="high" />
            {article.cover_illustrator && (
              <figcaption className="mt-3 px-4 font-mono text-caption text-text-tertiary md:px-0">
                Ilustrasi · {article.cover_illustrator}
              </figcaption>
            )}
          </figure>
        )}

        <article className="mt-10 border-t border-border-default/20 pt-10">{children}</article>

        <ArticleInteractions
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
