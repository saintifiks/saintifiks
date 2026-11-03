'use client'

// ShareButton — bagikan artikel. Ponsel: lembar bagikan bawaan perangkat. Desktop: panel berisi daftar
// pilihan teks (tanpa logo platform). "Salin tautan" memberi umpan balik lewat notifikasi.
// Kartu cerita Instagram dibuat dari kartu tersembunyi di bagian bawah berkas ini (tidak berubah).

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { usePathname } from 'next/navigation'
import { IconButton, Sheet, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { shareApi, type ContentKind } from '@/lib/engagement/kinds'

type ShareButtonProps = {
  articleId: string
  articleTitle: string
  articleExcerpt?: string | null
  articleSlug: string
  kind?: ContentKind
}

export default function ShareButton({
  articleId,
  articleTitle,
  articleExcerpt,
  articleSlug,
  kind = 'article',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { userId } = useAuth()
  const toast = useToast()

  const storyRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Ponsel dengan lembar bagikan bawaan: pakai itu langsung. Selain itu buka panel.
  const handleOpen = async () => {
    const url = `${window.location.origin}${pathname}`
    const touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    if (touch && typeof navigator.share === 'function') {
      try {
        // Tidak dicatat: platform tujuan lembar bawaan tidak diketahui, dan basis data hanya mengenal platform tertentu.
        await navigator.share({ title: articleTitle, url })
      } catch {
        // pengguna membatalkan — tidak ada yang perlu dilakukan
      }
      return
    }
    setIsOpen(true)
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
          const file = new File([blob], `saintifiks-${articleSlug}-story.png`, { type: 'image/png' })
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
      link.download = `saintifiks-${articleSlug}-story.png`
      link.href = dataUrl
      link.click()
      if (userId) await trackShare('instagram')
    }, 100)
  }

  // Track share ke database
  const trackShare = async (platform: string) => {
    try {
      await fetch(shareApi.url(kind), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: shareApi.body(kind, articleId, platform),
      })
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }

  // Share ke platform lain
  const handleShare = async (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = `${window.location.origin}${pathname}`
    const text = `Baca: "${articleTitle}" di @saintifiks`

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
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400')
    if (userId) await trackShare(platform)
    setIsOpen(false)
  }

  // Salin tautan
  const handleCopyLink = async () => {
    const url = `${window.location.origin}${pathname}`
    try {
      await navigator.clipboard.writeText(url)
      toast({ message: 'Tautan artikel sudah ada di papan klip.', label: 'Disalin' })
      setIsOpen(false)
      if (userId) await trackShare('copy')
    } catch {
      toast({ message: 'Tautan tidak bisa disalin otomatis. Salin dari bilah alamat browser.', tone: 'danger' })
    }
  }

  const rows: { id: 'copy' | 'whatsapp' | 'twitter' | 'facebook' | 'instagram'; label: string; hint: string; disabled?: boolean }[] = [
    { id: 'copy', label: 'Salin tautan', hint: 'Salin' },
    { id: 'whatsapp', label: 'WhatsApp', hint: 'Buka' },
    { id: 'twitter', label: 'X (Twitter)', hint: 'Buka' },
    { id: 'facebook', label: 'Facebook', hint: 'Buka' },
    { id: 'instagram', label: 'Kartu untuk Instagram', hint: isGenerating ? 'Membuat' : 'Unduh gambar', disabled: isGenerating },
  ]

  function run(id: (typeof rows)[number]['id']) {
    if (id === 'copy') void handleCopyLink()
    else if (id === 'instagram') void handleInstagramStory()
    else void handleShare(id)
  }

  return (
    <>
      <IconButton icon="share" label="Bagikan artikel" onClick={handleOpen} />

      <Sheet open={isOpen} onClose={() => setIsOpen(false)} title="Bagikan">
        <ul className="-my-1 divide-y divide-border-default/15">
          {rows.map((row) => (
            <li key={row.label}>
              <button
                type="button"
                onClick={() => run(row.id)}
                disabled={row.disabled}
                aria-busy={row.disabled || undefined}
                className="group flex w-full items-baseline justify-between gap-4 py-4 text-left disabled:opacity-50"
              >
                <span className="font-display text-lg text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast group-hover:decoration-text-primary">
                  {row.label}
                </span>
                <span className="font-mono text-caption text-text-tertiary">{row.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      {/* Hidden Instagram Story Preview (untuk generate gambar) */}
      {showPreview && (
        <div className="fixed -left-[9999px] top-0" aria-hidden="true">
          <div
            ref={storyRef}
            className="w-[1080px] h-[1920px] bg-paper flex flex-col items-center justify-center p-16 relative overflow-hidden"
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
                <path d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z" fill="#F7F5F0"/>
                <path d="M38.2842 56.7739H39.8914C40.0941 58.0927 40.4706 59.2797 41.0208 60.3347C41.6 61.3898 42.3095 62.2837 43.1493 63.0164C44.0181 63.749 45.0027 64.3205 46.1032 64.7308C47.2326 65.1118 48.4488 65.3023 49.752 65.3023C51.895 65.3023 53.5891 64.7895 54.8343 63.7637C56.0796 62.7379 56.7022 61.3458 56.7022 59.5874C56.7022 58.8547 56.5719 58.1806 56.3113 57.5652C56.0796 56.9497 55.6742 56.3636 55.095 55.8067C54.5158 55.2206 53.7339 54.6491 52.7493 54.0922C51.7936 53.5354 50.5773 52.9346 49.1004 52.2898C47.305 51.4985 45.7991 50.7365 44.5828 50.0039C43.3665 49.2712 42.3964 48.5092 41.6724 47.7179C40.9484 46.9266 40.4272 46.0913 40.1086 45.2121C39.819 44.3036 39.6742 43.2778 39.6742 42.1348C39.6742 40.7867 39.9059 39.5411 40.3692 38.3981C40.8615 37.2551 41.5421 36.2733 42.4109 35.4527C43.2796 34.6028 44.3077 33.9581 45.495 33.5184C46.6823 33.0495 47.9855 32.8151 49.4045 32.8151C50.6787 32.8151 51.866 33.0202 52.9665 33.4305C54.0669 33.8408 55.1819 34.5002 56.3113 35.4088L57.4407 33.4305H58.4398L58.9176 42.1788H57.3104C56.6153 39.7756 55.6018 37.9878 54.2696 36.8155C52.9665 35.6432 51.3882 35.0571 49.5348 35.0571C47.7683 35.0571 46.3638 35.4967 45.3213 36.3759C44.2787 37.2551 43.7575 38.4421 43.7575 39.9368C43.7575 40.6401 43.8733 41.2849 44.105 41.8711C44.3366 42.4279 44.7131 42.9701 45.2344 43.4976C45.7556 43.9958 46.4362 44.5087 47.276 45.0363C48.1158 45.5345 49.1583 46.062 50.4036 46.6189C52.5466 47.586 54.3276 48.4945 55.7466 49.3444C57.1656 50.1651 58.295 51.0003 59.1348 51.8502C59.9746 52.6708 60.5683 53.5501 60.9158 54.4879C61.2633 55.3964 61.437 56.4222 61.437 57.5652C61.437 59.0305 61.1474 60.3787 60.5683 61.6096C59.9891 62.8405 59.1782 63.8956 58.1357 64.7748C57.0932 65.654 55.8479 66.3427 54.4 66.841C52.952 67.3099 51.3592 67.5443 49.6217 67.5443C47.971 67.5443 46.4796 67.3099 45.1475 66.841C43.8443 66.3721 42.5122 65.5807 41.1511 64.4671L39.9349 66.6212H38.9358L38.2842 56.7739Z" fill="#1A1917"/>
              </svg>
            </div>

            {/* Konten utama */}
            <div className="z-10 text-center max-w-4xl">
              {/* Quote mark */}
              <p className="text-ink/20 text-9xl leading-none mb-8">&ldquo;</p>
              
              {/* Judul */}
<h1 
                 className="text-ink text-6xl leading-tight font-bold mb-12"
                style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {articleTitle}
              </h1>

              {/* Excerpt jika ada */}
              {articleExcerpt && (
<p 
                   className="text-ink/70 text-2xl leading-relaxed mb-16 max-w-3xl mx-auto"
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
                <p className="font-interface text-base text-ink/50 tracking-wider uppercase mb-4">
                  Baca selengkapnya di
                </p>
                <p className="font-interface text-xl text-text-link tracking-[0.2em] uppercase">
                  Saintifiks
                </p>
              </div>
            </div>

            {/* Footer strip */}
            <div className="absolute bottom-20 left-0 w-full px-16">
              <div className="flex items-center justify-between">
                <p className="font-interface text-sm text-ink/40">
                  Jurnalisme independen untuk Indonesia
                </p>
                <div className="w-16 h-1 bg-interactive-primary" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
