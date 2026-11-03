'use client'

// Layar onboarding username — muncul saat user belum punya profil
// Setelah submit berhasil, parent di-notify untuk reload profil

import { useState } from 'react'

type UsernameSetupProps = {
  onComplete: () => void
}

const RESERVED_USERNAMES = [
  'admin', 'api', 'akun', 'tulis', 'opinions',
  'penulis', 'login', 'auth', 'dashboard', 'artikel',
  'koreksi', 'null', 'undefined',
]

function isValidUsernameFormat(username: string): boolean {
  return /^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/.test(username)
}

export default function UsernameSetup({ onComplete }: UsernameSetupProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function validateUsername(val: string): string {
    if (!val) return 'Username wajib diisi'
    if (!isValidUsernameFormat(val)) {
      return 'Hanya huruf kecil, angka, dan tanda hubung. Minimal 3 karakter.'
    }
    if (RESERVED_USERNAMES.includes(val)) return 'Username tidak tersedia'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const usernameError = validateUsername(username.trim())
    if (usernameError) { setError(usernameError); return }
    if (!displayName.trim()) { setError('Nama tampil wajib diisi'); return }
    if (displayName.trim().length > 100) { setError('Nama tampil maksimal 100 karakter'); return }

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

      onComplete()
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <p className="font-interface text-xs text-warm-gray uppercase tracking-widest mb-2">
            Satu langkah lagi
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">
            Buat profil penulis kamu
          </h1>
          <p className="font-interface text-sm text-warm-gray mt-2 leading-relaxed">
            Username bersifat permanen dan tidak dapat diubah setelah disimpan. Pilih dengan bijak.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block font-interface text-xs text-warm-gray uppercase tracking-widest mb-2">
              Username
            </label>
            <div className="flex items-center border border-ink/15 bg-white focus-within:border-ink/40 transition-colors duration-150">
              <span className="font-interface text-sm text-warm-gray pl-3 pr-1 select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  setError('')
                }}
                placeholder="contoh-username"
                maxLength={30}
                className="flex-1 py-2.5 pr-3 font-interface text-sm text-ink bg-transparent focus:outline-none placeholder:text-warm-gray"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <p className="font-interface text-xs text-warm-gray mt-1">
              Huruf kecil, angka, tanda hubung · 3–30 karakter · Tidak bisa diubah
            </p>
          </div>

          {/* Nama tampil */}
          <div>
            <label className="block font-interface text-xs text-warm-gray uppercase tracking-widest mb-2">
              Nama Tampil
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setError('') }}
              placeholder="Nama yang terlihat di artikel"
              maxLength={100}
              className="w-full border border-ink/15 bg-white px-3 py-2.5 font-interface text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink/40 transition-colors duration-150"
            />
            <p className="font-interface text-xs text-warm-gray mt-1">
              Bisa diubah kapan saja
            </p>
          </div>

          {error && (
            <p className="font-interface text-xs text-signal-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-interface text-sm bg-ink text-paper py-3 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan dan Mulai Menulis'}
          </button>

        </form>
      </div>
    </div>
  )
}
