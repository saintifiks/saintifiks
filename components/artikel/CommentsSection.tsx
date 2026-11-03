'use client'

// CommentsSection — tombol komentar (dengan jumlah) + panel komentar.
// Komentar anonim ("Pembaca"). Menulis butuh login: pembaca yang belum masuk melihat ajakan di dalam panel,
// draf diingat sampai kembali dari Google. Setelah terkirim, notifikasi singkat.

import { useEffect, useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button, IconButton, Sheet, Textarea, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIntent, signInWithGoogle, takeIntent } from '@/lib/auth-client'
import { formatTanggalPendek } from '@/lib/format-date'
import { commentApi, type ContentKind } from '@/lib/engagement/kinds'

type Comment = {
  id: string
  content: string
  created_at: string
}

type CommentsSectionProps = {
  articleId: string
  kind?: ContentKind
}

const draftKey = (articleId: string) => `saintifiks-comment-draft:${articleId}`

export default function CommentsSection({ articleId, kind = 'article' }: CommentsSectionProps) {
  const { userId, ready } = useAuth()
  const toast = useToast()
  const pathname = usePathname()
  const fieldId = useId()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      return sessionStorage.getItem(draftKey(articleId)) ?? ''
    } catch {
      return ''
    }
  })
  const [sending, setSending] = useState(false)

  // Satu permintaan saat halaman dibuka (untuk jumlah); daftar ikut dipakai panel.
  useEffect(() => {
    let active = true
    fetch(commentApi.listUrl(kind, articleId))
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data) => {
        if (active) setComments(data.comments ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [articleId, kind])

  // Buka panel bila pengguna baru kembali dari Google untuk berkomentar. Ditunda satu giliran agar
  // bukan pembaruan state sinkron di dalam efek.
  useEffect(() => {
    if (!ready || !userId) return
    if (takeIntent('comment', articleId)) {
      const timer = setTimeout(() => setOpen(true), 0)
      return () => clearTimeout(timer)
    }
  }, [ready, userId, articleId])

  function updateDraft(value: string) {
    setDraft(value)
    try {
      if (value) sessionStorage.setItem(draftKey(articleId), value)
      else sessionStorage.removeItem(draftKey(articleId))
    } catch {
      // abaikan
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const res = await fetch(commentApi.url(kind), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: commentApi.body(kind, articleId, content),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setComments((current) => [data.comment, ...current])
      updateDraft('')
      toast({ message: 'Komentar Anda sudah tampil.', tone: 'success', label: 'Terkirim' })
    } catch {
      toast({
        message: 'Komentar belum terkirim. Teks Anda masih tersimpan; coba lagi.',
        tone: 'danger',
      })
    } finally {
      setSending(false)
    }
  }

  const footer = userId ? (
    <form onSubmit={submit} className="space-y-4">
      <label htmlFor={fieldId} className="sr-only">
        Komentar Anda
      </label>
      <Textarea
        id={fieldId}
        value={draft}
        onChange={(e) => updateDraft(e.target.value)}
        placeholder="Tulis komentar"
        disabled={sending}
        maxLength={1000}
      />
      <Button type="submit" size="sm" disabled={!draft.trim() || sending} aria-busy={sending}>
        {sending ? 'Mengirim' : 'Kirim komentar'}
      </Button>
    </form>
  ) : (
    <div className="space-y-3">
      <p className="font-display text-sm leading-relaxed text-text-secondary">
        Masuk dengan Google untuk menulis komentar. Komentar tampil sebagai “Pembaca”, tanpa nama.
      </p>
      <Button
        size="sm"
        onClick={() => {
          saveIntent({ type: 'comment', articleId })
          void signInWithGoogle(pathname)
        }}
      >
        Masuk dengan Google
      </Button>
    </div>
  )

  return (
    <>
      <div className="flex items-center xl:flex-col">
        <IconButton
          icon="comment"
          label={loading ? 'Buka komentar' : `Buka komentar, ${comments.length} komentar`}
          onClick={() => setOpen(true)}
        />
        {!loading && comments.length > 0 && (
          <span aria-hidden="true" className="-ml-1 font-mono text-caption text-text-secondary xl:ml-0 xl:-mt-1">
            {comments.length}
          </span>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Komentar" meta={comments.length || undefined} footer={footer}>
        {loading ? (
          <div role="status" className="space-y-6">
            <span className="sr-only">Memuat komentar</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse bg-border-default/15" />
                <div className="h-10 w-full animate-pulse bg-border-default/10" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="font-display text-base italic leading-relaxed text-text-secondary">
            Belum ada komentar. Tulis yang pertama di bawah.
          </p>
        ) : (
          <ul className="divide-y divide-border-default/15">
            {comments.map((comment) => (
              <li key={comment.id} className="py-5 first:pt-0">
                <p className="whitespace-pre-line font-display text-base leading-relaxed text-text-primary">
                  {comment.content}
                </p>
                <p className="mt-2 font-mono text-caption text-text-tertiary">
                  Pembaca · {formatTanggalPendek(comment.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
