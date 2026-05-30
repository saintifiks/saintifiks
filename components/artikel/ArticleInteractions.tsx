'use client'

// Client Component wrapper untuk seluruh section interaksi
// [PERUBAHAN SESI #28 v3] — Tambah error boundary untuk isolasi error per komponen

import { useState, useEffect } from 'react'
import LikeButton from './LikeButton'
import ShareButton from './ShareButton'
import CommentsSection from './CommentsSection'
import CorrectionSection from './CorrectionSection'

// Error Boundary sederhana untuk satu komponen
function SafeComponent({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (hasError) {
    return fallback || null
  }
  
  return <>{children}</>
}

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
      {/* Toolbar interaksi utama */}
      <div className="mt-12 pt-8 border-t border-ink/10">

        {/* Satu baris: koreksi rata kiri, like+komentar+share rata kanan */}
        <div className="flex items-center justify-between">

          {/* Kiri: icon Koreksi & Klarifikasi */}
          <SafeComponent fallback={null}>
            <CorrectionSection
              articleId={articleId}
              corrections={corrections}
            />
          </SafeComponent>

          {/* Kanan: Like + Komentar + Share */}
          <div className="flex items-center gap-3">
            <SafeComponent fallback={null}>
              <LikeButton articleId={articleId} />
            </SafeComponent>

            <SafeComponent fallback={null}>
              <CommentsSection articleId={articleId} />
            </SafeComponent>

            <SafeComponent fallback={null}>
              <ShareButton
                articleId={articleId}
                articleTitle={articleTitle}
                articleExcerpt={articleExcerpt}
                articleSlug={articleSlug}
              />
            </SafeComponent>
          </div>

        </div>

      </div>
    </>
  )
}