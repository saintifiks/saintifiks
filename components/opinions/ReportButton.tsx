'use client'

// Tombol laporkan artikel + modal alasan laporan
// Hanya muncul untuk user yang login dan bukan penulis artikel

import { useId, useMemo, useState } from 'react'
import { Flag, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModalDialog } from '@/lib/use-modal-dialog'

type ReportButtonProps = {
  articleId: string
}

export default function ReportButton({ articleId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState('')
  const reasonFieldId = useId()
  const errorId = useId()
  const counterId = useId()

  const supabase = useMemo(() => createClient(), [])
  const handleClose = () => {
    setIsOpen(false)
    setReason('')
    setError('')
    setIsDone(false)
  }
  const { dialogRef, triggerRef, initialFocusRef } = useModalDialog({
    isOpen,
    onClose: handleClose,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Alasan laporan minimal 10 karakter')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: { prompt: 'select_account' },
            redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
          },
        })
        return
      }

      const res = await fetch(`/api/opinions/${articleId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengirim laporan')
        return
      }

      setIsDone(true)
      setTimeout(handleClose, 2000)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex min-h-[44px] items-center gap-1.5 px-2 font-helvetica text-xs text-ink/40 transition-colors duration-150 hover:text-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
      >
        <Flag size={13} />
        <span>Laporkan</span>
      </button>

      {/* Modal laporan */}
      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opinion-report-dialog-title"
          tabIndex={-1}
        >
          <div className="w-full max-w-md border border-ink/10 bg-paper p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3
                id="opinion-report-dialog-title"
                className="font-helvetica text-sm font-bold text-ink uppercase tracking-widest"
              >
                Laporkan Artikel
              </h3>
              <button
                ref={initialFocusRef}
                type="button"
                onClick={handleClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink/40 transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                aria-label="Tutup laporan artikel"
              >
                <X size={18} />
              </button>
            </div>

            {isDone ? (
              <p role="status" className="font-helvetica text-sm text-signal-success text-center py-4">
                ✓ Laporan berhasil dikirim. Terima kasih.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor={reasonFieldId}
                  className="block font-helvetica text-xs text-ink/50 uppercase tracking-widest mb-2"
                >
                  Alasan laporan
                </label>
                <textarea
                  id={reasonFieldId}
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError('') }}
                  placeholder="Jelaskan mengapa artikel ini perlu ditinjau (min. 10 karakter)"
                  rows={4}
                  maxLength={500}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${errorId} ${counterId}` : counterId}
                  className="w-full resize-none border border-ink/15 bg-transparent px-3 py-2.5 font-helvetica text-sm text-ink placeholder:text-ink/30 focus:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                />
                <div className="flex justify-between items-center mt-1 mb-4">
                  {error ? (
                    <p id={errorId} role="alert" className="font-helvetica text-xs text-signal-danger">{error}</p>
                  ) : (
                    <span />
                  )}
                  <span id={counterId} className="font-helvetica text-xs text-ink/30">
                    {reason.length}/500
                  </span>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="min-h-[44px] px-3 font-helvetica text-sm text-ink/50 transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || reason.trim().length < 10}
                    aria-busy={isSubmitting}
                    className="min-h-[44px] bg-ink px-5 py-2 font-helvetica text-sm text-paper transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  )
}
