'use client'

// [PERUBAHAN SESI #32] — Refactor ke bottom sheet: CommentButton (icon+count) + bottom sheet konten

import { useState, useEffect, useMemo } from 'react'
import { MessageCircle, Send, Loader2, User, X } from 'lucide-react'
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
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Instance Supabase singleton — jangan buat ulang setiap render
  const supabase = useMemo(() => createClient(), [])

  // Fetch comments dan cek login status
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/comments?articleId=${articleId}`)
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
      setIsLoadingComments(false)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUserId(session?.user?.id || null)
      } catch (sessionError) {
        console.error('Session check error:', sessionError)
      }
    }

    init()
  }, [articleId, supabase])

  // Kunci scroll body saat bottom sheet terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Submit komentar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!userId) {
      const origin = window.location.origin
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { prompt: 'select_account' },
          redirectTo: `${origin}${window.location.pathname}`,
        },
      })
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

  return (
    <>
      {/* Icon trigger — w-10 h-10 sejajar dengan icon lain, badge count di pojok */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border border-ink/30 text-ink/60 hover:border-ink hover:text-ink transition-colors duration-150"
        aria-label="Buka komentar"
        title="Komentar"
      >
        <MessageCircle size={18} />
        {!isLoadingComments && comments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-ink text-paper font-helvetica text-[10px] rounded-full flex items-center justify-center leading-none">
            {comments.length}
          </span>
        )}
      </button>

      {/* Bottom Sheet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Komentar"
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
            <div className="flex items-center justify-between px-5 py-3 border-b border-primary-dark/10">
<div className="flex items-center gap-2">
                 <h3 className="font-libre text-lg font-bold text-ink">Komentar</h3>
                 <span className="font-helvetica text-xs text-ink/50 bg-ink/5 px-2 py-0.5">
                   {comments.length}
                 </span>
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
{isLoadingComments ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex gap-3">
                       <div className="w-9 h-9 rounded-full bg-ink/10 animate-pulse flex-shrink-0" />
                       <div className="flex-1 space-y-2">
                         <div className="h-3 w-28 bg-ink/10 animate-pulse" />
                         <div className="h-12 w-full bg-ink/10 animate-pulse" />
                       </div>
                     </div>
                   ))}
                 </div>
               ) : comments.length === 0 ? (
<div className="text-center py-10">
                   <MessageCircle size={28} className="mx-auto mb-3 text-ink/20" />
                   <p className="font-helvetica text-sm text-ink/40">
                     Belum ada komentar. Jadilah yang pertama!
                   </p>
                 </div>
              ) : (
                <div className="space-y-5">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex-shrink-0">
{comment.user_avatar ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img
                             src={comment.user_avatar}
                             alt={comment.user_name}
                             className="w-9 h-9 rounded-full object-cover"
                           />
                         ) : (
                           <div className="w-9 h-9 rounded-full bg-ink/10 flex items-center justify-center">
                             <User size={14} className="text-ink/50" />
                           </div>
                         )}
                      </div>
                      <div className="flex-1">
<div className="flex items-center gap-2 mb-1">
                           <span className="font-helvetica font-medium text-sm text-ink">
                             {comment.user_name}
                           </span>
                           <span className="font-helvetica text-xs text-ink/40">
                             {formatDate(comment.created_at)}
                           </span>
                         </div>
<p className="font-helvetica text-sm text-ink/80 leading-relaxed">
                           {comment.content}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form komentar — pinned di bawah */}
            <div className="border-t border-primary-dark/10 px-5 py-4">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-3 items-end">
<textarea
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     placeholder={userId ? 'Tulis komentar...' : 'Login untuk berkomentar'}
                     disabled={isSubmitting}
                     rows={2}
                     className="flex-1 font-helvetica text-sm p-3 border border-ink/15 focus:border-ink focus:outline-none resize-none transition-colors"
                   />
<button
                     type={userId ? 'submit' : 'button'}
                     onClick={!userId ? async () => {
                       const origin = window.location.origin
                       await supabase.auth.signInWithOAuth({
                         provider: 'google',
                         options: {
                           queryParams: { prompt: 'select_account' },
                           redirectTo: `${origin}${window.location.pathname}`,
                         },
                       })
                     } : undefined}
                     disabled={userId ? (!newComment.trim() || isSubmitting) : false}
                     className="flex items-center justify-center w-10 h-10 bg-ink text-paper hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
                   >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
                {!userId && (
                  <p className="font-helvetica text-xs text-primary-dark/40 mt-2">
                    Login dengan Google untuk berkomentar
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
