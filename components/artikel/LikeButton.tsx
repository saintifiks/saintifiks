'use client'

// Komponen LikeButton — tombol suka artikel, icon only
// [PERUBAHAN SESI #32] — Hapus tampilan count, pertahankan pencatatan likes di DB

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
  
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function checkInitialState() {
      try {
        // Fetch status like user (apakah sudah like atau belum)
        const statusRes = await fetch(`/api/likes?articleId=${articleId}`, { cache: 'no-store', credentials: 'include' })
        if (statusRes.ok) {
          const data = await statusRes.json()
          setIsLiked(data.isLiked || false)
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

    // Optimistic update untuk isLiked (UX responsif)
    const previousState = isLiked
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
        credentials: 'include',
      })

      if (!res.ok) {
        // Rollback jika gagal
        setIsLiked(previousState)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setIsLiked(previousState)
    }
  }

  if (isLoading) {
    return (
      <div className="h-10 w-10 border border-primary-dark/10 bg-primary-dark/5 animate-pulse rounded-full" />
    )
  }

  return (
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
  )
}