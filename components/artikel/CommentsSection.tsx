'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  user_name: string
  user_avatar: string | null
}

type CommentsSectionProps = {
  articleId: string
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const supabase = createClient()

  // Fetch comments dan cek login status
  useEffect(() => {
    async function init() {
      // Fetch comments
      try {
        const res = await fetch(`/api/comments?articleId=${articleId}`)
        // [FIX] Cek content-type dan status sebelum parse JSON
        const contentType = res.headers.get('content-type')
        if (res.ok && contentType?.includes('application/json')) {
          const data = await res.json()
          setComments(data.comments || [])
        } else {
          console.warn('Comments API returned non-JSON or error status:', res.status)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
      setIsLoading(false)

      // Cek session
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUserId(session?.user?.id || null)
      } catch (sessionError) {
        console.error('Session check error:', sessionError)
      }
    }

    init()
  }, [articleId, supabase])

  // Submit komentar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!userId) {
      setIsLoginPromptOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          content: newComment.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Tambah komentar baru ke list
        setComments([data.comment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    }

    setIsSubmitting(false)
  }

  // Format tanggal
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Tampilkan 3 komentar pertama saja jika belum expanded
  const displayedComments = isExpanded ? comments : comments.slice(0, 3)

  return (
    <div className="mt-16 pt-8 border-t border-primary-dark/10">
      {/* Header dengan icon dan count */}
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle size={24} className="text-primary-dark/70" />
        <h3 className="font-libre text-2xl font-bold text-primary-dark">
          Komentar
        </h3>
        <span className="font-helvetica text-sm text-primary-dark/50 bg-primary-dark/5 px-3 py-1">
          {comments.length}
        </span>
      </div>

      {/* Form komentar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="border border-primary-dark/15 focus-within:border-primary-dark transition-colors">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={userId ? 'Tulis komentar Anda...' : 'Masuk untuk menulis komentar'}
            disabled={!userId || isSubmitting}
            className="w-full h-24 font-helvetica p-4 resize-none focus:outline-none disabled:bg-primary-dark/5"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-primary-dark/10">
            <p className="font-helvetica text-xs text-primary-dark/40">
              {userId ? 'Komentar akan dipublikasikan' : 'Login dengan Google untuk berkomentar'}
            </p>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-primary-light font-helvetica text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Kirim
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Daftar komentar */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-dark/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-primary-dark/10 animate-pulse" />
                <div className="h-16 w-full bg-primary-dark/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 border border-primary-dark/10 bg-primary-dark/5">
          <MessageCircle size={32} className="mx-auto mb-3 text-primary-dark/30" />
          <p className="font-helvetica text-sm text-primary-dark/50">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.user_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.user_avatar}
                    alt={comment.user_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-dark/10 flex items-center justify-center">
                    <User size={16} className="text-primary-dark/50" />
                  </div>
                )}
              </div>

              {/* Konten komentar */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-helvetica font-medium text-sm text-primary-dark">
                    {comment.user_name}
                  </span>
                  <span className="font-helvetica text-xs text-primary-dark/40">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="font-helvetica text-sm text-primary-dark/80 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* Tombol "Lihat semua" jika ada lebih dari 3 komentar */}
          {comments.length > 3 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-3 border border-primary-dark/20 font-helvetica text-sm text-primary-dark/70 hover:bg-primary-dark/5 transition-colors"
            >
              Lihat {comments.length - 3} komentar lainnya
            </button>
          )}
        </div>
      )}

      {/* Modal login prompt */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/50 p-4">
          <div className="bg-primary-light max-w-sm w-full p-6 border border-primary-dark/20">
            <h4 className="font-libre text-lg font-bold text-primary-dark mb-2">
              Login Diperlukan
            </h4>
            <p className="font-helvetica text-sm text-primary-dark/70 mb-4">
              Silakan login dengan Google untuk menulis komentar.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLoginPromptOpen(false)}
                className="flex-1 py-2 border border-primary-dark/30 font-helvetica text-sm hover:bg-primary-dark/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const origin = window.location.origin
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      queryParams: { prompt: 'select_account' },
                      redirectTo: `${origin}${window.location.pathname}`,
                    },
                  })
                }}
                className="flex-1 py-2 bg-primary-dark text-primary-light font-helvetica text-sm hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
