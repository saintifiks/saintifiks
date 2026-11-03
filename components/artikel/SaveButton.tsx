'use client'

// SaveButton — simpan artikel ke Daftar Bacaan. Terisi bila tersimpan. Notifikasi menawarkan "Lihat" setelah
// menyimpan. Belum login: notifikasi menawarkan masuk; setelah kembali dari Google, penyimpanan dilanjutkan.

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { IconButton, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIntent, takeIntent } from '@/lib/auth-client'

export default function SaveButton({ articleId }: { articleId: string }) {
  const { userId, ready } = useAuth()
  const toast = useToast()
  const pathname = usePathname()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const sendRef = useRef<(next: boolean) => Promise<void>>(async () => {})

  const send = useCallback(
    async (next: boolean) => {
      setSaved(next)
      setBusy(true)
      try {
        const res = await fetch('/api/bookmarks', {
          method: next ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
          credentials: 'include',
        })
        if (!res.ok) throw new Error(String(res.status))
        if (next) {
          toast({
            message: 'Artikel masuk ke Daftar Bacaan Anda.',
            tone: 'success',
            label: 'Disimpan',
            action: { label: 'Lihat', href: '/akun/bacaan' },
          })
        } else {
          toast({
            message: 'Artikel dihapus dari Daftar Bacaan.',
            label: 'Dihapus',
            action: { label: 'Urungkan', onClick: () => void sendRef.current(true) },
          })
        }
      } catch {
        setSaved(!next)
        toast({ message: 'Belum tersimpan. Coba lagi sebentar lagi.', tone: 'danger' })
      } finally {
        setBusy(false)
      }
    },
    [articleId, toast]
  )

  useEffect(() => {
    sendRef.current = send
  }, [send])

  // Status simpan hanya ditanyakan bila sudah login; lanjutkan simpan yang tertunda setelah status diketahui.
  useEffect(() => {
    if (!ready || !userId) return
    let active = true
    fetch(`/api/bookmarks?articleId=${articleId}`, { cache: 'no-store', credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return
        const already = !!data?.saved
        if (data) setSaved(already)
        if (takeIntent('save', articleId) && !already) void send(true)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [ready, userId, articleId, send])

  function handleClick() {
    if (!userId) {
      saveIntent({ type: 'save', articleId })
      toast({
        message: 'Masuk dengan Google untuk menyimpan artikel. Artikel ini akan tersimpan otomatis setelah Anda masuk.',
        label: 'Perlu masuk',
        duration: 9000,
        action: { label: 'Masuk', href: `/masuk?next=${encodeURIComponent(pathname)}` },
      })
      return
    }
    void send(!saved)
  }

  return (
    <IconButton
      icon="bookmark"
      label={saved ? 'Hapus dari Daftar Bacaan' : 'Simpan ke Daftar Bacaan'}
      pressed={saved}
      disabled={busy}
      onClick={handleClick}
    />
  )
}
