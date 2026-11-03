'use client'

// ArticleInteractions — bilah aksi artikel (suka · simpan · komentar · bagikan · koreksi · tampilan baca).
// Satu elemen DOM yang berpindah tempat lewat CSS (agar status tidak terduplikasi):
//  • ponsel/tablet (<1280px): bilah tetap di dasar layar;
//  • desktop (≥1280px): rel lengket di sebelah kiri kolom artikel, ikon bertumpuk vertikal.
// Wajib ditempatkan di dalam pembungkus `relative` selebar kolom artikel.

import LikeButton from './LikeButton'
import SaveButton from './SaveButton'
import ReportSection from './ReportSection'
import ShareButton from './ShareButton'
import CommentsSection from './CommentsSection'
import CorrectionSection from './CorrectionSection'
import ReaderSettings from './ReaderSettings'
import type { ContentKind } from '@/lib/engagement/kinds'

type ArticleInteractionsProps = {
  articleId: string
  articleTitle: string
  articleExcerpt: string | null
  articleSlug: string
  // 'opinion' = tulisan Argumen: tanpa Simpan, dengan Laporkan
  kind?: ContentKind
  corrections: {
    id: string
    original_text: string
    corrected_text: string
    explanation: string | null
    created_at: string
  }[]
}

export default function ArticleInteractions({
  articleId,
  articleTitle,
  articleExcerpt,
  articleSlug,
  kind = 'article',
  corrections,
}: ArticleInteractionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Aksi artikel"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border-default/20 bg-surface-page pb-[env(safe-area-inset-bottom)] xl:absolute xl:inset-y-0 xl:-left-24 xl:right-auto xl:w-14 xl:border-0 xl:bg-transparent xl:pb-0"
    >
      <div className="mx-auto flex max-w-[720px] items-center justify-between px-3 sm:px-0 xl:sticky xl:top-32 xl:mx-0 xl:max-w-none xl:flex-col xl:justify-start xl:gap-1 xl:px-0">
        <LikeButton articleId={articleId} kind={kind} />
        {kind === 'article' && <SaveButton articleId={articleId} />}
        <CommentsSection articleId={articleId} kind={kind} />
        <ShareButton
          articleId={articleId}
          articleTitle={articleTitle}
          articleExcerpt={articleExcerpt}
          articleSlug={articleSlug}
          kind={kind}
        />
        <CorrectionSection articleId={articleId} corrections={corrections} kind={kind} />
        {kind === 'opinion' && <ReportSection articleId={articleId} />}
        <ReaderSettings />
      </div>
    </div>
  )
}
