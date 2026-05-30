'use client'

// [PERUBAHAN SESI #32] — Refactor ke icon-only + bottom sheet

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import { submitCorrection } from '@/app/(admin)/dashboard/koreksi/actions'

type Correction = {
  id: string
  original_text: string
  corrected_text: string
  explanation: string | null
  created_at: string
}

type CorrectionSectionProps = {
  articleId: string
  corrections: Correction[]
}

export default function CorrectionSection({ articleId, corrections }: CorrectionSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Kunci scroll body saat bottom sheet terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!originalText.trim() || !correctedText.trim()) return

    setIsSubmitting(true)
    setMessage(null)

    const result = await submitCorrection({
      article_id: articleId,
      original_text: originalText,
      corrected_text: correctedText,
      explanation: explanation
    })

    if ('error' in result && result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Koreksi berhasil dikirim. Terima kasih!' })
      setOriginalText('')
      setCorrectedText('')
      setExplanation('')
    }

    setIsSubmitting(false)
  }

  const correctionCount = corrections.length

  return (
    <>
      {/* Icon trigger — rata kiri, warna accent-blue untuk membedakan */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-sea-deep/40 text-sea-deep hover:border-sea-deep hover:bg-sea-deep/5 transition-colors duration-150 relative"
        aria-label="Koreksi & Klarifikasi"
        title="Koreksi & Klarifikasi"
      >
        <AlertCircle size={18} />
        {correctionCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-sea-deep text-paper font-helvetica text-[10px] rounded-full flex items-center justify-center leading-none">
            {correctionCount}
          </span>
        )}
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Koreksi & Klarifikasi"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-paper w-full max-h-[85vh] flex flex-col rounded-t-2xl shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-ink/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-sea-deep" />
                <h3 className="font-libre text-lg font-bold text-ink">Koreksi & Klarifikasi</h3>
                {correctionCount > 0 && (
                  <span className="font-helvetica text-xs text-sea-deep bg-sea-deep/10 px-2 py-0.5">
                    {correctionCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-ink/10 rounded-full transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Daftar koreksi yang sudah disetujui */}
              {corrections.length > 0 ? (
                <div className="space-y-6 mb-6">
                  {corrections.map((corr) => (
                    <div key={corr.id} className="border-l-4 border-sea-deep pl-4 py-1">
                      <p className="font-helvetica text-xs text-ink/40 mb-2 uppercase tracking-widest">Koreksi</p>
                      <div className="mb-3">
                        <p className="text-ink/60 line-through text-sm">{corr.original_text}</p>
                        <p className="text-ink font-medium text-sm mt-1">{corr.corrected_text}</p>
                      </div>
                      {corr.explanation && (
                        <p className="font-helvetica text-sm text-ink/70 italic border-l-2 border-ink/20 pl-3">
                          {corr.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-helvetica text-sm text-ink/40 mb-6">
                  Belum ada koreksi untuk artikel ini.
                </p>
              )}

              {/* Form usulan koreksi */}
              <div className="border-t border-ink/10 pt-5">
                <p className="font-helvetica text-xs text-ink/40 uppercase tracking-widest mb-4">
                  Usulkan Koreksi
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-helvetica text-xs text-ink/50 mb-1.5">
                      Teks asli yang ingin dikoreksi
                    </label>
                    <textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      className="w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus:outline-none resize-none transition-colors"
                      placeholder="Salin teks asli dari artikel..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-helvetica text-xs text-ink/50 mb-1.5">
                      Teks yang diusulkan
                    </label>
                    <textarea
                      value={correctedText}
                      onChange={(e) => setCorrectedText(e.target.value)}
                      className="w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus:outline-none resize-none transition-colors"
                      placeholder="Tulis versi yang benar..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-helvetica text-xs text-ink/50 mb-1.5">
                      Penjelasan (opsional)
                    </label>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus:outline-none resize-none transition-colors"
                      placeholder="Mengapa ini perlu dikoreksi?"
                    />
                  </div>

                  {message && (
                    <div className={`p-3 border text-sm font-helvetica ${message.type === 'success' ? 'border-sea-deep/30 bg-sea-deep/5 text-sea-deep' : 'border-accent-red/30 bg-accent-red/5 text-accent-red'}`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-ink text-paper py-3 font-helvetica text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      'Kirim untuk Ditinjau'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}