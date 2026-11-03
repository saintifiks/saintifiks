'use client'

// QuickAddForm — formulir tambah penulis/penerbit di halaman referensi Bookstore. Memberi umpan balik lewat
// notifikasi (sebelumnya hasil aksi dibuang diam-diam) dan mengosongkan isian setelah berhasil.

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Field, Input, Textarea, useToast } from '@/components/ui'
import { tambahPenulis, tambahPenerbit } from '@/app/(admin)/dashboard/bookstore/actions'

export default function QuickAddForm({ kind }: { kind: 'penulis' | 'penerbit' }) {
  const id = useId()
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState('')
  const [biography, setBiography] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || sending) return
    setSending(true)
    const result = kind === 'penulis' ? await tambahPenulis({ name, biography }) : await tambahPenerbit({ name })
    setSending(false)
    if ('error' in result) {
      toast({ message: result.error, tone: 'danger' })
      return
    }
    setName('')
    setBiography('')
    toast({ message: kind === 'penulis' ? 'Penulis ditambahkan.' : 'Penerbit ditambahkan.', tone: 'success', label: 'Tersimpan' })
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <Field label={kind === 'penulis' ? 'Nama penulis' : 'Nama penerbit'} required>
        <Input
          id={`${id}-nama`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === 'penulis' ? 'Misal: Pramoedya Ananta Toer' : 'Misal: Gramedia'}
          maxLength={150}
          required
        />
      </Field>
      {kind === 'penulis' && (
        <Field label="Biografi singkat" hint="Opsional.">
          <Textarea
            id={`${id}-bio`}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            maxLength={5000}
          />
        </Field>
      )}
      <Button type="submit" size="sm" disabled={!name.trim() || sending} aria-busy={sending}>
        {sending ? 'Menyimpan' : kind === 'penulis' ? 'Simpan penulis' : 'Simpan penerbit'}
      </Button>
    </form>
  )
}
