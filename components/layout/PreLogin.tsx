'use client'

// PreLogin — halaman pra-login (gerbang masuk akun).
// Ditampilkan saat pengguna membuka area akun tapi belum login.
// Memulai alur Google OAuth via Supabase. Desain selaras Design System V2.

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type PreLoginProps = {
  // Tujuan setelah login berhasil (mis. '/akun')
  next?: string
  title?: string
  description?: string
}

export default function PreLogin({
  next = '/akun',
  title = 'Masuk ke Saintifiks',
  description = 'Masuk untuk mengakses akun dan fitur Saintifiks.',
}: PreLoginProps) {
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
    // Tidak perlu reset loading: halaman akan dialihkan ke Google.
  }

  return (
    <main className="min-h-[70vh] bg-paper flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="font-display text-[24px] font-bold leading-none text-ink hover:opacity-60 transition-opacity duration-150"
        >
          Saintifiks
        </Link>

        <h1 className="font-display text-display-sm font-bold text-ink mt-10">
          {title}
        </h1>
        <p className="font-interface text-body-sm text-warm-gray mt-3">
          {description}
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-8 bg-ink text-paper font-interface text-sm py-3 px-4 hover:opacity-80 transition-opacity duration-150 disabled:opacity-50"
        >
          {loading ? 'Membuka Google…' : 'Masuk dengan Google'}
        </button>

        <Link
          href="/"
          className="inline-block font-mono text-kicker uppercase tracking-widest text-warm-gray hover:text-ink transition-colors duration-150 mt-8"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
