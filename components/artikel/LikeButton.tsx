'use client'

// Komponen LikeButton — tombol suka artikel dengan optimistic update dan count
// [PERUBAHAN SESI #30] — Semua operasi likes via API server-side (admin client, bypass RLS)

import { useState, useEffect, useMemo } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

type LikeButtonProps = {
  articleId: string
}

export default function LikeButton({ articleId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function checkInitialState() {
      try {
        // Fetch count dan status like secara paralel
        const [countRes, statusRes] = await Promise.all([
          fetch(`/api/likes/count?articleId=${articleId}`, { cache: 'no-store' }),
          fetch(`/api/likes?articleId=${articleId}`, { cache: 'no-store' }),
        ])

        if (countRes.ok) {
          const data = await countRes.json()
          console.log('[LikeButton] count dari API:', data.count, '| articleId:', articleId)
          setLikeCount(data.count || 0)
        } else {
          console.error('[LikeButton] count API gagal:', countRes.status, await countRes.text())
        }

        if (statusRes.ok) {
          const data = await statusRes.json()
          console.log('[LikeButton] isLiked dari API:', data.isLiked)
          setIsLiked(data.isLiked || false)
        } else {
          console.error('[LikeButton] status API gagal:', statusRes.status, await statusRes.text())
        }
      } catch (err) {
        console.error('Error fetching like state:', err)
      }

      // Cek apakah user sudah login (hanya untuk tombol login)
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session?.user)

      setIsLoading(false)
    }
    
    checkInitialState()
  }, [articleId])

  async function handleLikeClick() {
    if (!isLoggedIn) {
      setIsLoggingIn(true)
      
      const origin = window.location.origin
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Memaksa Google menampilkan pemilihan akun (account chooser)
          queryParams: {
            prompt: 'select_account'
          },
          redirectTo: `${origin}/auth/callback?next=${pathname}`,
        },
      })
      
      return
    }

    // Optimistic update hanya untuk isLiked (UX responsif), count menunggu server
    const previousState = isLiked
    const previousCount = likeCount
    setIsLiked(!previousState)

    if (!previousState) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'klik_like',
          path: pathname,
          session_id: 'interaction',
          metadata: { article_id: articleId }
        }),
        keepalive: true
      }).catch(() => {})
    }

    try {
      const res = await fetch('/api/likes', {
        method: previousState ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
        cache: 'no-store',
      })

      if (!res.ok) {
        // Rollback jika gagal
        setIsLiked(previousState)
        setLikeCount(previousCount)
      } else {
        const data = await res.json()
        if (typeof data.count === 'number') {
          setLikeCount(data.count)
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setIsLiked(previousState)
      setLikeCount(previousCount)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 border border-primary-dark/10 bg-primary-dark/5 animate-pulse rounded-full"></div>
        <div className="h-4 w-16 bg-primary-dark/10 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLikeClick}
        disabled={isLoggingIn}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 ${
          isLiked 
            ? 'bg-accent-red text-primary-light' 
            : 'bg-transparent border border-primary-dark/30 text-primary-dark hover:border-accent-red hover:text-accent-red'
        } disabled:opacity-50`}
        aria-label={isLiked ? 'Batalkan suka' : 'Sukai artikel'}
        title={isLiked ? 'Telah disukai' : 'Sukai artikel'}
      >
        {isLoggingIn ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
        )}
      </button>
      
      <span className="font-helvetica text-sm text-primary-dark/70">
        {likeCount > 0 ? `${likeCount} suka` : 'Jadilah yang pertama menyukai'}
      </span>
    </div>
  )
}