'use client'

// RemoveBookmarkButton — hapus satu artikel dari Daftar Bacaan (di halaman daftar). Baris hilang setelah server menyegarkan.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, useToast } from '@/components/ui'

export default function RemoveBookmarkButton({ articleId }: { articleId: string }) {
  const router = useRouter()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error(String(res.status))
      router.refresh()
    } catch {
      toast({ message: 'Belum terhapus. Coba lagi sebentar lagi.', tone: 'danger' })
      setBusy(false)
    }
  }

  return (
    <Button variant="text" size="sm" onClick={remove} disabled={busy} className="shrink-0">
      Hapus
    </Button>
  )
}
