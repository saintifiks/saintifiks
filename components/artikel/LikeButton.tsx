'use client'

// LikeButton — suka artikel. Terisi bila disukai. Umpan balik: ikon berubah seketika (optimistis);
// bila gagal, kembali dan muncul notifikasi. Belum login: tidak langsung melempar ke Google —
// notifikasi menjelaskan dan menawarkan masuk; setelah kembali, suka dilanjutkan otomatis.

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { IconButton, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIntent, signInWithGoogle, takeIntent } from '@/lib/auth-client'
import { likeApi, type ContentKind } from '@/lib/engagement/kinds'

type LikeButtonProps = {
  articleId: string
  kind?: ContentKind
}

export default function LikeButton({ articleId, kind = 'article' }: LikeButtonProps) {
  const { userId, ready } = useAuth()
  const toast = useToast()
  const pathname = usePathname()
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)


  const send = useCallback(
    async (next: boolean) => {
      setLiked(next)
      setBusy(true)
      if (next && kind === 'article') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'klik_like',
            path: pathname,
            session_id: 'interaction',
            metadata: { article_id: articleId },
          }),
          keepalive: true,
        }).catch(() => {})
      }
      try {
        const req = likeApi.request(kind, articleId, next)
        const res = await fetch(req.url, { ...req.init, cache: 'no-store', credentials: 'include' })
        if (!res.ok) throw new Error(String(res.status))
      } catch {
        setLiked(!next)
        toast({ message: 'Suka belum tersimpan. Coba lagi sebentar lagi.', tone: 'danger' })
      } finally {
        setBusy(false)
      }
    },
    [articleId, kind, pathname, toast]
  )

  // Status suka hanya ditanyakan bila sudah login — pembaca anonim tidak memicu permintaan.
  // Suka yang tertunda sebelum dialihkan ke Google dilanjutkan di sini, setelah status diketahui.
  useEffect(() => {
    if (!ready || !userId) return
    let active = true
    fetch(likeApi.statusUrl(kind, articleId), { cache: 'no-store', credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return
        const already = likeApi.isLiked(kind, data)
        if (data) setLiked(already)
        if (takeIntent('like', articleId) && !already) {
          void send(true)
          toast({ message: 'Anda masuk. Artikel ini sudah Anda sukai.', tone: 'success', label: 'Disukai' })
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [ready, userId, articleId, kind, send, toast])

  function handleClick() {
    if (!userId) {
      saveIntent({ type: 'like', articleId })
      toast({
        message: 'Masuk dengan Google untuk menyukai artikel ini. Suka Anda akan tersimpan otomatis.',
        label: 'Perlu masuk',
        duration: 9000,
        action: { label: 'Masuk', onClick: () => void signInWithGoogle(pathname) },
      })
      return
    }
    void send(!liked)
  }

  return (
    <IconButton
      icon="heart"
      label={liked ? 'Batalkan suka' : 'Sukai artikel'}
      pressed={liked}
      disabled={busy}
      onClick={handleClick}
    />
  )
}
