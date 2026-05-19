'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

type LikeButtonProps = {
  articleId: string
}

export default function LikeButton({ articleId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkLikeStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
        
        // Cek secara spesifik apakah user ini sudah melike artikel ini
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
    // Jika user belum login, panggil Google OAuth dan sematkan URL artikel di parameter 'next'
    if (!userId) {
      const origin = window.location.origin
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${pathname}`,
        },
      })
      return
    }

    // Optimistic Update: Langsung ubah UI sebelum proses jaringan selesai
    const previousState = isLiked
    setIsLiked(!previousState)
    // Rekam interaksi ke analitik secara asinkron
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
      // Eksekusi insert like baru ke database
      const { error } = await supabase
        .from('likes')
        .insert({ article_id: articleId, user_id: userId })
      
      // Rollback UI jika server menolak (error jaringan/otorisasi)
      if (error) setIsLiked(previousState)
    } else {
      // Eksekusi hapus like dari database
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId)
      
      // Rollback UI jika server menolak
      if (error) setIsLiked(previousState)
    }
  }

  // Tampilan placeholder sebelum status like selesai diverifikasi
  if (isLoading) {
    return (
      <div className="h-10 w-[120px] border border-primary-dark/10 bg-primary-dark/5 animate-pulse"></div>
    )
  }

  return (
    <button
      onClick={handleLikeClick}
      className={`font-helvetica text-sm px-6 py-2.5 transition-colors duration-150 border ${
        isLiked 
          ? 'bg-primary-dark text-primary-light border-primary-dark' 
          : 'bg-transparent text-primary-dark border-primary-dark/40 hover:border-primary-dark'
      }`}
    >
      {isLiked ? 'Telah Disukai' : 'Sukai Artikel'}
    </button>
  )
}