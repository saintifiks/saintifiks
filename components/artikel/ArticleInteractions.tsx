'use client'

// Client Component wrapper untuk seluruh section interaksi
// Ini memastikan section selalu render fresh di browser

import LikeButton from './LikeButton'
import ShareButton from './ShareButton'
import CommentsSection from './CommentsSection'
import CorrectionSection from './CorrectionSection'

type ArticleInteractionsProps = {
  articleId: string
  articleTitle: string
  articleExcerpt: string | null
  articleSlug: string
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
  corrections,
}: ArticleInteractionsProps) {
  return (
    <>
      {/* Section Interaksi: Like, Share */}
      <div className="mt-12 pt-8 border-t border-primary-dark/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <LikeButton articleId={articleId} />
          </div>
          
          <ShareButton 
            articleId={articleId}
            articleTitle={articleTitle}
            articleExcerpt={articleExcerpt}
            articleSlug={articleSlug}
          />
        </div>
        
        <p className="font-helvetica text-xs text-primary-dark/40 mt-6 text-center sm:text-left">
          Dukung jurnalisme independen dengan menyukai dan membagikan artikel ini.
        </p>
      </div>

      {/* Koreksi Section */}
      <CorrectionSection 
        articleId={articleId} 
        corrections={corrections} 
      />

      {/* Komentar Section */}
      <CommentsSection articleId={articleId} />
    </>
  )
}
