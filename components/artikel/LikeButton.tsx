'use client'

// Komponen LikeButton — tombol suka artikel dengan optimistic update
// [PERUBAHAN SESI #16] — Improve Login UX: tambah prompt select_account + loading feedback

import { useState, useEffect } from 'react'
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
  
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkLikeStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
        
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', session.user.id)
          .single()
        
        if (data) {
          setIsLiked(true)
        }
      }
      setIsLoading(false)
    }
    
    checkLikeStatus()
  }, [articleId, supabase])

  async function handleLikeClick() {
    // Jika user belum login → trigger OAuth dengan account chooser
    if (!userId) {
      setIsLoggingIn(true)
      
      const origin = window.location.origin
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Memaksa Google menampilkan pemilihan akun / konfirmasi
          prompt: 'select_account',
          redirectTo: `${origin}/auth/callback?next=${pathname}`,
        },
      })
      
      // Note: setIsLoggingIn(false) tidak diperlukan karena akan redirect
      return
    }

    // Jika sudah login → proses like/unlike (tetap sama)
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
      <div className="h-10 w-[120px] border border-primary-dark/10 bg-primary-dark/5 animate-pulse"></div>
    )
  }

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoggingIn}
      className={`font-helvetica text-sm px-6 py-2.5 transition-colors duration-150 border ${
        isLiked 
          ? 'bg-primary-dark text-primary-light border-primary-dark' 
          : 'bg-transparent text-primary-dark border-primary-dark/40 hover:border-primary-dark'
      } disabled:opacity-50 flex items-center gap-2`}
    >
      {isLoggingIn ? (
        <>Membuka Google...</>
      ) : isLiked ? (
        'Telah Disukai'
      ) : (
        'Sukai Artikel'
      )}
    </button>
  )
}