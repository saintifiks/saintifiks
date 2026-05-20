'use client'

// Halaman login admin — hanya untuk pemilik Saintifiks
// Client Component karena menggunakan browser Supabase client untuk memulai OAuth flow

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Setelah login Google berhasil, Supabase mengarahkan ke URL ini
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-primary-light text-primary-dark flex items-center justify-center px-6 dark:bg-primary-dark dark:text-primary-light">
      <div className="w-full max-w-sm">

        <div className="mb-10">
          <Link
            href="/"
            className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest hover:text-primary-dark transition-colors duration-150 dark:text-primary-light/40 dark:hover:text-primary-light"
          >
            ← Saintifiks
          </Link>
          <h1 className="font-libre text-3xl font-bold text-primary-dark mt-6 dark:text-primary-light">
            Admin
          </h1>
          <p className="font-helvetica text-sm text-primary-dark/60 mt-2 dark:text-primary-light/60">
            Masuk untuk mengelola artikel Saintifiks.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-primary-dark text-primary-light font-helvetica text-sm py-3 px-4 hover:opacity-80 transition-opacity duration-150"
        >
          Masuk dengan Google
        </button>

      </div>
    </main>
  )
}
