'use client'

// [PERUBAHAN SESI #32] — Refactor ke icon-only + bottom sheet

import { useId, useState } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import { submitCorrection } from '@/app/(admin)/dashboard/koreksi/actions'
import { useModalDialog } from '@/lib/use-modal-dialog'

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
  const fieldId = useId()
  const { dialogRef, triggerRef, initialFocusRef } = useModalDialog({
    isOpen,
    onClose: () => setIsOpen(false),
  })

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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-accent-blue/40 text-accent-blue transition-colors duration-150 hover:border-accent-blue hover:bg-accent-blue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        aria-label={`Koreksi & Klarifikasi${correctionCount > 0 ? `, ${correctionCount} koreksi` : ''}`}
        title="Koreksi & Klarifikasi"
      >
        <AlertCircle size={18} />
        {correctionCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-4 h-4 bg-accent-blue text-paper font-helvetica text-[10px] rounded-full flex items-center justify-center leading-none"
          >
            {correctionCount}
          </span>
        )}
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-correction-dialog-title"
          tabIndex={-1}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
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
                <AlertCircle size={18} className="text-accent-blue" />
                <h3
                  id="article-correction-dialog-title"
                  className="font-libre text-lg font-bold text-ink"
                >
                  Koreksi & Klarifikasi
                </h3>
                {correctionCount > 0 && (
                  <span className="font-helvetica text-xs text-accent-blue bg-accent-blue/10 px-2 py-0.5">
                    {correctionCount}
                  </span>
                )}
              </div>
              <button
                ref={initialFocusRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors hover:bg-ink/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                aria-label="Tutup Koreksi & Klarifikasi"
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
                    <div key={corr.id} className="border-l-4 border-accent-blue pl-4 py-1">
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
                    <label
                      htmlFor={`${fieldId}-original-text`}
                      className="block font-helvetica text-xs text-ink/50 mb-1.5"
                    >
                      Teks asli yang ingin dikoreksi
                    </label>
                    <textarea
                      id={`${fieldId}-original-text`}
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      className="bg-transparent w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary resize-none transition-colors"
                      placeholder="Salin teks asli dari artikel..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${fieldId}-corrected-text`}
                      className="block font-helvetica text-xs text-ink/50 mb-1.5"
                    >
                      Teks yang diusulkan
                    </label>
                    <textarea
                      id={`${fieldId}-corrected-text`}
                      value={correctedText}
                      onChange={(e) => setCorrectedText(e.target.value)}
                      className="bg-transparent w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary resize-none transition-colors"
                      placeholder="Tulis versi yang benar..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${fieldId}-explanation`}
                      className="block font-helvetica text-xs text-ink/50 mb-1.5"
                    >
                      Penjelasan (opsional)
                    </label>
                    <textarea
                      id={`${fieldId}-explanation`}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="bg-transparent w-full h-16 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary resize-none transition-colors"
                      placeholder="Mengapa ini perlu dikoreksi?"
                    />
                  </div>

                  {message && (
                    <div
                      role={message.type === 'error' ? 'alert' : 'status'}
                      className={`p-3 border text-sm font-helvetica ${message.type === 'success' ? 'border-ink/20 bg-ink/5 text-ink' : 'border-accent-red/30 bg-accent-red/5 text-accent-red'}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full min-h-[44px] bg-ink text-paper py-3 font-helvetica text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
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
