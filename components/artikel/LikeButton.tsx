'use client'

// Komponen LikeButton — tombol suka artikel dengan optimistic update dan count
// [PERUBAHAN SESI #28] — Tambah icon Heart dan tampilkan jumlah like publik

import { useState, useEffect } from 'react'
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
  const [userId, setUserId] = useState<string | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkLikeStatus() {
      // Fetch total likes count
      try {
        const res = await fetch(`/api/likes/count?articleId=${articleId}`)
        if (res.ok) {
          const data = await res.json()
          setLikeCount(data.count || 0)
        }
      } catch (error) {
        console.error('Error fetching like count:', error)
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
        
        // [FIX] Gunakan maybeSingle() dan wrap dengan try-catch
        try {
          const { data, error: likeError } = await supabase
            .from('likes')
            .select('id')
            .eq('article_id', articleId)
            .eq('user_id', session.user.id)
            .maybeSingle()
          
          if (likeError) {
            console.warn('Like status check error (non-fatal):', likeError)
          } else if (data) {
            setIsLiked(true)
          }
        } catch (err) {
          console.error('Error checking like status:', err)
        }
      }
      setIsLoading(false)
    }
    
    checkLikeStatus()
  }, [articleId, supabase])

  async function handleLikeClick() {
    if (!userId) {
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

    // Proses like/unlike dengan optimistic update count
    const previousState = isLiked
    const previousCount = likeCount
    
    setIsLiked(!previousState)
    setLikeCount(previousState ? previousCount - 1 : previousCount + 1)

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

    if (!previousState) {
      const { error } = await supabase
        .from('likes')
        .insert({ article_id: articleId, user_id: userId })
      
      if (error) setIsLiked(previousState)
    } else {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId)
      
      if (error) setIsLiked(previousState)
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