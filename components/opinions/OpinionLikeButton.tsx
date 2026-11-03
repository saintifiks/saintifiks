'use client'

// Like button untuk artikel opinions — terpisah dari LikeButton editorial
// Menggunakan /api/opinions/[id]/like endpoint

import { useState, useEffect, useMemo } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type OpinionLikeButtonProps = {
  articleId: string
}

export default function OpinionLikeButton({ articleId }: OpinionLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      if (session) {
        try {
          const res = await fetch(`/api/opinions/${articleId}/like`, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            setIsLiked(data.liked)
          }
        } catch {
          // Gagal cek like — tidak perlu error fatal
        }
      }
      setIsLoading(false)
    }
    init()
  }, [articleId, supabase])

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    })
  }

  async function handleToggleLike() {
    if (!isLoggedIn) {
      handleLogin()
      return
    }
    if (isProcessing) return

    setIsProcessing(true)
    const previousLiked = isLiked
    setIsLiked(!isLiked)

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/opinions/${articleId}/like`, { method })
      if (!res.ok) {
        setIsLiked(previousLiked)
      }
    } catch {
      setIsLiked(previousLiked)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-ink/5 animate-pulse" />
    )
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isProcessing}
      aria-label={isLiked ? 'Hapus like' : 'Like artikel ini'}
      className={`flex items-center gap-2 px-4 py-2 border transition-all duration-150 font-interface text-sm disabled:opacity-50 ${
        isLiked
          ? 'border-signal-danger/30 bg-signal-danger/5 text-signal-danger'
          : 'border-ink/15 text-warm-gray hover:border-ink/30 hover:text-ink'
      }`}
    >
      <Heart
        size={16}
        className={isLiked ? 'fill-signal-danger stroke-signal-danger' : ''}
      />
      <span>{isLiked ? 'Disukai' : 'Suka'}</span>
    </button>
  )
}
