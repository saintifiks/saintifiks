'use client'

// DeleteAccount — hapus akun secara permanen. Dua langkah: membuka panel penjelasan, lalu mengetik kata HAPUS.
// Tidak bisa dibatalkan, jadi akibatnya dijelaskan sebelum tombol aktif.

import { useState } from 'react'
import { Button, Field, Input, Sheet } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const CONFIRM_WORD = 'HAPUS'

export default function DeleteAccount() {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function close() {
    if (busy) return
    setOpen(false)
    setTyped('')
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (typed !== CONFIRM_WORD) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/akun/hapus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konfirmasi: typed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Akun belum berhasil dihapus. Coba lagi atau hubungi kami.')
        setBusy(false)
        return
      }
      await createClient().auth.signOut().catch(() => {})
      window.location.href = '/'
    } catch {
      setError('Terjadi gangguan. Coba lagi sebentar lagi.')
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Hapus akun
      </Button>

      <Sheet open={open} onClose={close} title="Hapus akun?">
        <ul className="space-y-4 font-display text-body-sm leading-relaxed text-text-secondary">
          <li>Akun, profil, dan semua tulisan Argumen Anda dihapus permanen, termasuk komentar di tulisan itu.</li>
          <li>Komentar, suka, dan Daftar Bacaan Anda di artikel lain ikut terhapus.</li>
          <li>Koreksi Anda yang sudah tayang di artikel tetap ada, tanpa nama.</li>
          <li>Ini tidak bisa dibatalkan. Unduh data Anda dulu bila ingin menyimpannya.</li>
        </ul>
        <form onSubmit={submit} className="mt-8 space-y-6">
          <Field label={`Ketik ${CONFIRM_WORD} untuk melanjutkan`}>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="characters" />
          </Field>
          {error && (
            <p role="alert" className="border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
              {error}
            </p>
          )}
          <div className="flex items-center gap-6">
            <Button type="submit" variant="danger" disabled={typed !== CONFIRM_WORD || busy}>
              {busy ? 'Menghapus' : 'Hapus akun saya'}
            </Button>
            <Button variant="text" onClick={close} disabled={busy}>
              Batal
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
