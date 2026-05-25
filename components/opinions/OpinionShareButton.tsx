'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { toPng } from 'html-to-image'
import { Share2, Link2, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

type OpinionShareButtonProps = {
  articleId: string
  articleTitle: string
  articleExcerpt?: string | null
  articleSlug: string
  authorDisplayName: string
}

export default function OpinionShareButton({
  articleId,
  articleTitle,
  articleExcerpt,
  articleSlug,
  authorDisplayName,
}: OpinionShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const storyRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  // Instance Supabase singleton — jangan buat ulang setiap render
  const supabase = useMemo(() => createClient(), [])

  // Cek status login
  const checkUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUserId(session?.user?.id || null)
  }, [supabase])

  const handleOpen = () => {
    setIsOpen(true)
    checkUser()
  }

  // Generate gambar Instagram Story 1080x1920
  const generateStoryImage = async () => {
    if (!storyRef.current) return null

    setIsGenerating(true)
    try {
      const dataUrl = await toPng(storyRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
      })
      return dataUrl
    } catch (error) {
      console.error('Error generating image:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // Download atau share gambar story
  const handleInstagramStory = async () => {
    setShowPreview(true)
    // Tunggu render selesai
    setTimeout(async () => {
      const dataUrl = await generateStoryImage()
      if (!dataUrl) return

      // Coba Web Share API (berfungsi di mobile — bisa langsung ke Instagram)
      const canShare = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
      if (canShare) {
        try {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          const file = new File([blob], `saintifiks-opinions-${articleSlug}-story.png`, { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: articleTitle,
            })
            if (userId) await trackShare('instagram')
            return
          }
        } catch {
          // User batalkan share atau API gagal — fallback ke download
        }
      }

      // Fallback: download gambar (desktop atau browser yang tidak support Web Share API)
      const link = document.createElement('a')
      link.download = `saintifiks-opinions-${articleSlug}-story.png`
      link.href = dataUrl
      link.click()
      if (userId) await trackShare('instagram')
    }, 100)
  }

  // Track share ke tabel opinion_shares
  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/opinion-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinion_article_id: articleId, platform }),
      })
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }

  // Share ke platform lain
  const handleShare = async (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = `${window.location.origin}${pathname}`
    // Sertakan nama penulis dalam teks share — identitas penting untuk artikel opini
    const text = `Baca opini "${articleTitle}" oleh ${authorDisplayName} di @saintifiks`

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }

    if (userId) {
      await trackShare(platform)
    }

    setIsOpen(false)
  }

  // Copy link
  const handleCopyLink = async () => {
    const url = `${window.location.origin}${pathname}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    if (userId) {
      await trackShare('copy')
    }
  }

  return (
    <>
      {/* Tombol Share — icon only, rounded */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-primary-dark/30 text-primary-dark/60 hover:border-primary-dark hover:text-primary-dark transition-colors duration-150"
        aria-label="Bagikan artikel"
        title="Bagikan"
      >
        <Share2 size={18} />
      </button>

      {/* Bottom Sheet Share */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Bagikan artikel"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-primary-dark/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-primary-light w-full rounded-t-2xl shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-primary-dark/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-primary-dark/10">
              <h3 className="font-libre text-lg font-bold text-primary-dark">Bagikan Artikel</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-primary-dark/10 rounded-full transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pilihan platform — grid 4 kolom */}
            <div className="px-5 pt-5 pb-4 grid grid-cols-4 gap-3">
              {/* Instagram Story */}
              <button
                onClick={handleInstagramStory}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-dark/5 rounded-xl transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={28} className="animate-spin text-primary-dark/60" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-dark/70">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                )}
                <span className="font-helvetica text-xs text-primary-dark/60 text-center leading-tight">
                  {isGenerating ? 'Membuat...' : 'Instagram'}
                </span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-dark/5 rounded-xl transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-dark/70">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-helvetica text-xs text-primary-dark/60">Twitter</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-dark/5 rounded-xl transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-dark/70">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="font-helvetica text-xs text-primary-dark/60">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-dark/5 rounded-xl transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-dark/70">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-helvetica text-xs text-primary-dark/60">Facebook</span>
              </button>
            </div>

            {/* Copy Link */}
            <div className="px-5 pb-6">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 border border-primary-dark/15 hover:bg-primary-dark/5 transition-colors font-helvetica text-sm text-primary-dark/70"
              >
                <Link2 size={16} />
                {copied ? 'Link disalin!' : 'Salin Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Instagram Story Preview (untuk generate gambar) */}
      {showPreview && (
        <div className="fixed -left-[9999px] top-0">
          <div
            ref={storyRef}
            className="w-[1080px] h-[1920px] bg-primary-dark flex flex-col items-center justify-center p-16 relative overflow-hidden"
            style={{ fontFamily: 'Libre Baskerville, Georgia, serif' }}
          >
            {/* Background pattern tipis */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #F5F4F0 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Logo / Brand */}
            <div className="absolute top-20 left-0 w-full flex justify-center">
              <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
                <path d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z" fill="#F5F4F0"/>
                <path d="M38.2842 56.7739H39.8914C40.0941 58.0927 40.4706 59.2797 41.0208 60.3347C41.6 61.3898 42.3095 62.2837 43.1493 63.0164C44.0181 63.749 45.0027 64.3205 46.1032 64.7308C47.2326 65.1118 48.4488 65.3023 49.752 65.3023C51.895 65.3023 53.5891 64.7895 54.8343 63.7637C56.0796 62.7379 56.7022 61.3458 56.7022 59.5874C56.7022 58.8547 56.5719 58.1806 56.3113 57.5652C56.0796 56.9497 55.6742 56.3636 55.095 55.8067C54.5158 55.2206 53.7339 54.6491 52.7493 54.0922C51.7936 53.5354 50.5773 52.9346 49.1004 52.2898C47.305 51.4985 45.7991 50.7365 44.5828 50.0039C43.3665 49.2712 42.3964 48.5092 41.6724 47.7179C40.9484 46.9266 40.4272 46.0913 40.1086 45.2121C39.819 44.3036 39.6742 43.2778 39.6742 42.1348C39.6742 40.7867 39.9059 39.5411 40.3692 38.3981C40.8615 37.2551 41.5421 36.2733 42.4109 35.4527C43.2796 34.6028 44.3077 33.9581 45.495 33.5184C46.6823 33.0495 47.9855 32.8151 49.4045 32.8151C50.6787 32.8151 51.866 33.0202 52.9665 33.4305C54.0669 33.8408 55.1819 34.5002 56.3113 35.4088L57.4407 33.4305H58.4398L58.9176 42.1788H57.3104C56.6153 39.7756 55.6018 37.9878 54.2696 36.8155C52.9665 35.6432 51.3882 35.0571 49.5348 35.0571C47.7683 35.0571 46.3638 35.4967 45.3213 36.3759C44.2787 37.2551 43.7575 38.4421 43.7575 39.9368C43.7575 40.6401 43.8733 41.2849 44.105 41.8711C44.3366 42.4279 44.7131 42.9701 45.2344 43.4976C45.7556 43.9958 46.4362 44.5087 47.276 45.0363C48.1158 45.5345 49.1583 46.062 50.4036 46.6189C52.5466 47.586 54.3276 48.4945 55.7466 49.3444C57.1656 50.1651 58.295 51.0003 59.1348 51.8502C59.9746 52.6708 60.5683 53.5501 60.9158 54.4879C61.2633 55.3964 61.437 56.4222 61.437 57.5652C61.437 59.0305 61.1474 60.3787 60.5683 61.6096C59.9891 62.8405 59.1782 63.8956 58.1357 64.7748C57.0932 65.654 55.8479 66.3427 54.4 66.841C52.952 67.3099 51.3592 67.5443 49.6217 67.5443C47.971 67.5443 46.4796 67.3099 45.1475 66.841C43.8443 66.3721 42.5122 65.5807 41.1511 64.4671L39.9349 66.6212H38.9358L38.2842 56.7739Z" fill="#0D0D0D"/>
              </svg>
            </div>

            {/* Konten utama */}
            <div className="z-10 text-center max-w-4xl">
              {/* Badge Opinions */}
              <div className="flex justify-center mb-10">
                <span className="font-helvetica text-sm tracking-[0.25em] uppercase text-primary-light/50 border border-primary-light/20 px-4 py-1.5">
                  Opinions
                </span>
              </div>

              {/* Quote mark */}
              <p className="text-primary-light/20 text-9xl leading-none mb-8">&ldquo;</p>

              {/* Judul */}
              <h1
                className="text-primary-light text-6xl leading-tight font-bold mb-10"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {articleTitle}
              </h1>

              {/* Nama penulis — perbedaan utama dari artikel editorial */}
              <p className="font-helvetica text-2xl text-primary-light/60 mb-6">
                oleh <span className="text-primary-light font-medium">{authorDisplayName}</span>
              </p>

              {/* Excerpt jika ada */}
              {articleExcerpt && (
                <p
                  className="text-primary-light/50 text-xl leading-relaxed mb-16 max-w-3xl mx-auto"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {articleExcerpt}
                </p>
              )}

              {/* CTA */}
              <div className="mt-12">
                <p className="font-helvetica text-base text-primary-light/50 tracking-wider uppercase mb-4">
                  Baca selengkapnya di
                </p>
                <p className="font-helvetica text-xl text-accent-blue tracking-[0.2em] uppercase">
                  Saintifiks
                </p>
              </div>
            </div>

            {/* Footer strip */}
            <div className="absolute bottom-20 left-0 w-full px-16">
              <div className="flex items-center justify-between">
                <p className="font-helvetica text-sm text-primary-light/40">
                  Jurnalisme independen untuk Indonesia
                </p>
                <div className="w-16 h-1 bg-accent-blue" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
