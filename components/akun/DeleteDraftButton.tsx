'use client'

// DeleteDraftButton — hapus draf milik penulis. Hanya draf yang bisa dihapus (aturan di API); tulisan terbit harus
// ditarik ke draf dahulu. Meminta konfirmasi lewat panel karena draf yang dihapus tidak bisa dipulihkan.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmSheet, useToast } from '@/components/ui'

export default function DeleteDraftButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/opinions/${articleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(String(res.status))
      toast({ message: `Draf “${title}” dihapus.`, label: 'Dihapus' })
      setOpen(false)
      router.refresh()
    } catch {
      toast({ message: 'Draf belum berhasil dihapus. Coba lagi sebentar lagi.', tone: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <ConfirmSheet
        open={open}
        title="Hapus draf?"
        confirmLabel="Hapus draf"
        busyLabel="Menghapus"
        busy={busy}
        danger
        onConfirm={remove}
        onClose={() => setOpen(false)}
      >
        <p>“{title}” dihapus permanen dan tidak bisa dipulihkan.</p>
      </ConfirmSheet>
    </>
  )
}
