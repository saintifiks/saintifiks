'use client'

import { useState } from 'react'
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
      setIsOpen(false)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="mt-16 pt-8 border-t border-primary-dark/10 dark:border-primary-light/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-libre text-2xl font-bold text-primary-dark dark:text-primary-light">Koreksi & Klarifikasi</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="font-helvetica text-sm px-5 py-2 border border-primary-dark/40 hover:bg-primary-dark hover:text-primary-light transition-colors dark:border-primary-light/40"
        >
          {isOpen ? 'Tutup Form' : 'Usulkan Koreksi'}
        </button>
      </div>

      {/* Daftar koreksi yang sudah disetujui */}
      {corrections.length > 0 && (
        <div className="space-y-8 mb-10">
          {corrections.map((corr) => (
            <div key={corr.id} className="space-y-4 border-l-4 border-accent-blue pl-6 py-4">
              <div>
                <p className="font-helvetica text-xs text-primary-dark/40 mb-2 dark:text-primary-light/40">KOREKSI</p>
                <p className="text-primary-dark font-medium mt-1 dark:text-primary-light">{corr.corrected_text}</p>
              </div>

              {corr.explanation && (
                <p className="font-helvetica text-sm text-primary-dark/70 italic border-l-2 border-primary-dark/20 pl-4 dark:text-primary-light/70 dark:border-primary-light/20">
                  {corr.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form usulan koreksi */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="border border-primary-dark/10 p-6 bg-primary-light dark:border-primary-light/10 dark:bg-primary-dark">
          <div className="space-y-5">
            <div>
              <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
                Teks Asli yang Ingin Dikoreksi
              </label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="w-full h-20 font-helvetica p-4 border border-primary-dark/15 focus:border-primary-dark resize-y"
                placeholder="Salin teks asli dari artikel..."
                required
              />
            </div>

            <div>
              <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
                Teks yang Diusulkan
              </label>
              <textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                className="w-full h-20 font-helvetica p-4 border border-primary-dark/15 focus:border-primary-dark resize-y"
                placeholder="Tulis versi yang benar..."
                required
              />
            </div>

            <div>
              <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
                Penjelasan (Opsional)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full h-24 font-helvetica p-4 border border-primary-dark/15 focus:border-primary-dark resize-y"
                placeholder="Mengapa ini perlu dikoreksi? Sumber referensi, dll."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-dark text-primary-light py-3 font-helvetica hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Mengirim Koreksi...' : 'Kirim Koreksi untuk Ditinjau'}
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className={`mt-4 p-4 border ${message.type === 'success' ? 'border-primary-dark/20 bg-primary-dark/5 dark:bg-primary-light/5' : 'border-accent-red/30 bg-accent-red/5'}`}>
          <p className={`font-helvetica text-sm ${message.type === 'success' ? 'text-primary-dark dark:text-primary-light' : 'text-accent-red'}`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  )
}