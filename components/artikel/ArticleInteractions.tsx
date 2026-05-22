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
      {/* Section Interaksi: Like, Share — selalu render meski error */}
      <div className="mt-12 pt-8 border-t border-primary-dark/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <SafeComponent fallback={
            <div className="font-helvetica text-sm text-primary-dark/50">
              Fitur like tidak tersedia
            </div>
          }>
            <LikeButton articleId={articleId} />
          </SafeComponent>
          
          <SafeComponent>
            <ShareButton 
              articleId={articleId}
              articleTitle={articleTitle}
              articleExcerpt={articleExcerpt}
              articleSlug={articleSlug}
            />
          </SafeComponent>
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

      {/* Komentar Section — diisolasi agar error tidak merusak yang lain */}
      <SafeComponent fallback={
        <div className="mt-16 pt-8 border-t border-primary-dark/10">
          <p className="font-helvetica text-sm text-primary-dark/50">
            Fitur komentar tidak tersedia saat ini.
          </p>
        </div>
      }>
        <CommentsSection articleId={articleId} />
      </SafeComponent>
    </>
  )
}
