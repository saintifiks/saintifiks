'use client'

// Tombol laporkan artikel + modal alasan laporan
// Hanya muncul untuk user yang login dan bukan penulis artikel

import { useState, useMemo } from 'react'
import { Flag, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ReportButtonProps = {
  articleId: string
}

export default function ReportButton({ articleId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState('')

  const supabase = useMemo(() => createClient(), [])

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
      setTimeout(() => setIsOpen(false), 2000)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark/70 transition-colors duration-150"
      >
        <Flag size={13} />
        <span>Laporkan</span>
      </button>

      {/* Modal laporan */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40">
          <div className="bg-primary-light border border-primary-dark/10 w-full max-w-md p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-helvetica text-sm font-bold text-primary-dark uppercase tracking-widest">
                Laporkan Artikel
              </h3>
              <button
                onClick={() => { setIsOpen(false); setReason(''); setError(''); setIsDone(false) }}
                className="text-primary-dark/40 hover:text-primary-dark transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {isDone ? (
              <p className="font-helvetica text-sm text-accent-green text-center py-4">
                ✓ Laporan berhasil dikirim. Terima kasih.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-2">
                  Alasan laporan
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError('') }}
                  placeholder="Jelaskan mengapa artikel ini perlu ditinjau (min. 10 karakter)"
                  rows={4}
                  maxLength={500}
                  className="w-full border border-primary-dark/15 bg-white px-3 py-2.5 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40 resize-none"
                />
                <div className="flex justify-between items-center mt-1 mb-4">
                  {error ? (
                    <p className="font-helvetica text-xs text-accent-red">{error}</p>
                  ) : (
                    <span />
                  )}
                  <span className="font-helvetica text-xs text-primary-dark/30">
                    {reason.length}/500
                  </span>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setReason(''); setError('') }}
                    className="font-helvetica text-sm text-primary-dark/50 hover:text-primary-dark transition-colors duration-150"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || reason.trim().length < 10}
                    className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
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
