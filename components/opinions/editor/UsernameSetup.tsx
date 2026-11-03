'use client'

// UsernameSetup — langkah pertama sebelum menulis Argumen: nama pengguna permanen dan nama tampil.
// Muncul hanya saat pembaca pertama kali membuka editor (bukan di gerbang masuk). Setelah berhasil,
// parent memuat ulang profil.

import { useId, useState } from 'react'
import { Button, Field, Input } from '@/components/ui'

type UsernameSetupProps = {
  onComplete: (username: string) => void
}

const RESERVED_USERNAMES = [
  'admin', 'api', 'akun', 'tulis', 'opinions', 'masuk',
  'penulis', 'login', 'auth', 'dashboard', 'artikel',
  'koreksi', 'null', 'undefined',
]

function isValidUsernameFormat(username: string): boolean {
  return /^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/.test(username)
}

export default function UsernameSetup({ onComplete }: UsernameSetupProps) {
  const formId = useId()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function validateUsername(val: string): string {
    if (!val) return 'Nama pengguna wajib diisi'
    if (!isValidUsernameFormat(val)) {
      return 'Hanya huruf kecil, angka, dan tanda hubung. Minimal 3 karakter.'
    }
    if (RESERVED_USERNAMES.includes(val)) return 'Nama pengguna tidak tersedia'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const usernameError = validateUsername(username.trim())
    if (usernameError) {
      setError(usernameError)
      return
    }
    if (!displayName.trim()) {
      setError('Nama tampil wajib diisi')
      return
    }
    if (displayName.trim().length > 100) {
      setError('Nama tampil maksimal 100 karakter')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          display_name: displayName.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat profil')
        return
      }
      onComplete(username.trim().toLowerCase())
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
        Satu langkah lagi
      </p>
      <h1 className="mt-3 font-display text-display-sm leading-[1.12] text-text-primary">Buat nama penulis Anda</h1>
      <p className="mt-4 font-display text-body-sm leading-relaxed text-text-secondary">
        Nama pengguna menjadi alamat halaman penulis Anda dan <strong className="font-bold">tidak bisa diubah</strong>{' '}
        setelah disimpan. Nama tampil bisa diubah kapan saja.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-9">
        <Field label="Nama pengguna" hint="Huruf kecil, angka, tanda hubung · 3–30 karakter">
          <Input
            id={`${formId}-username`}
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              setError('')
            }}
            placeholder="contoh-nama"
            maxLength={30}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Field label="Nama tampil" hint="Nama yang terlihat di artikel Anda">
          <Input
            id={`${formId}-nama`}
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              setError('')
            }}
            placeholder="Nama Anda"
            maxLength={100}
          />
        </Field>

        {error && (
          <p role="alert" className="border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Menyimpan' : 'Simpan dan mulai menulis'}
        </Button>
      </form>
    </div>
  )
}
