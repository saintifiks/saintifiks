'use client'

// Komponen Navbar — navigasi utama situs Saintifiks
// [PERUBAHAN SESI #16] — Improve Login UX: tambah prompt select_account via queryParams

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/layout/ThemeToggle'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  function getInitialFromName(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return ''
    const firstWord = trimmed.split(/\s+/)[0]
    return firstWord.charAt(0).toUpperCase()
  }

  // Cek status sesi dan subscribe perubahan auth — onAuthStateChange lebih reliabel
  // dari getSession() karena menangkap logout/login dari tab lain secara real-time
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      const displayName =
        session?.user?.user_metadata?.full_name || session?.user?.email || ''
      setUserInitial(getInitialFromName(displayName))
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Masuk: trigger Google OAuth dengan account chooser yang lebih jelas
  async function handleMasuk() {
    setIsLoggingIn(true)
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Memaksa Google menampilkan pemilihan akun / konfirmasi
        queryParams: {
          prompt: 'select_account'
        },
        // Kembalikan ke halaman yang sedang dibuka setelah login
        redirectTo: `${window.location.origin}/auth/callback?next=${pathname}`,
      },
    })
    
    // Note: setIsLoggingIn(false) tidak diperlukan karena halaman akan redirect
  }

  // Keluar: akhiri sesi, arahkan ke beranda
  async function handleKeluar() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Sembunyikan tombol Masuk/Keluar di halaman admin dan halaman login.
  const isHalamanAdmin =
    pathname.startsWith('/dashboard') || pathname === '/login'

  return (
    <nav className="border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-night transition-[border-color] duration-150">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between">

        {/* Brand — nama situs, link ke beranda */}
        {/* Tracking +15 sesuai Brand Guidelines untuk wordmark */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-ink dark:text-paper-night tracking-[0.06em] hover:opacity-60 transition-opacity duration-150"
        >
          Saintifiks
        </Link>

        {/* Navigasi tengah + kanan */}
        <div className="flex items-center gap-5">
          {/* Tombol ganti tema terang/gelap — tampil di semua halaman, di kiri tombol auth */}
          <ThemeToggle />

          {/* Tombol Masuk / Keluar — hanya tampil di halaman publik */}
          {!loading && !isHalamanAdmin && (
            isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/akun"
                  aria-label="Akun saya"
                  className="transition-opacity duration-150 hover:opacity-80"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center border border-ink/10 bg-ink text-paper dark:bg-paper dark:text-ink transition-all duration-150 rotate-45">
                    <span className="font-display text-xl font-bold -rotate-45 leading-none">
                      {userInitial || 'U'}
                    </span>
                  </span>
                </Link>
                <button
                  onClick={handleKeluar}
                  className="font-interface text-xs text-ink/40 dark:text-paper-night/40 hover:text-ink dark:hover:text-paper-night transition-colors duration-150"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={handleMasuk}
                disabled={isLoggingIn}
                className="font-interface text-xs text-ink/40 dark:text-paper-night/40 hover:text-ink dark:hover:text-paper-night transition-colors duration-150 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoggingIn ? (
                  <>Membuka Google...</>
                ) : (
                  <>Masuk</>
                )}
              </button>
            )
          )}
        </div>

      </div>
    </nav>
  )
}