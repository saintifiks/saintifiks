'use client'

// DeleteDraftButton — hapus draf milik penulis. Hanya draf yang bisa dihapus (aturan di API); tulisan terbit harus
// ditarik ke draf dahulu. Meminta konfirmasi karena draf yang dihapus tidak bisa dipulihkan.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, useToast } from '@/components/ui'

export default function DeleteDraftButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!window.confirm(`Hapus draf “${title}”? Draf yang dihapus tidak bisa dipulihkan.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/opinions/${articleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(String(res.status))
      toast({ message: 'Draf dihapus.', label: 'Dihapus' })
      router.refresh()
    } catch {
      toast({ message: 'Draf belum berhasil dihapus. Coba lagi sebentar lagi.', tone: 'danger' })
      setBusy(false)
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={remove} disabled={busy}>
      Hapus
    </Button>
  )
}
