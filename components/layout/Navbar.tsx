'use client'

// Komponen Navbar — navigasi utama situs Saintifiks
// [PERUBAHAN SESI #16] — Improve Login UX: tambah prompt select_account via queryParams

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  function getInitialFromName(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return ''
    const firstWord = trimmed.split(/\s+/)[0]
    return firstWord.charAt(0).toUpperCase()
  }

  // Cek status sesi saat komponen pertama kali dimuat
  useEffect(() => {
    async function cekSesi() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      const displayName =
        session?.user?.user_metadata?.full_name || session?.user?.email || ''
      setUserInitial(getInitialFromName(displayName))
      setLoading(false)
    }
    cekSesi()
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
    <nav className="border-b border-primary-dark/10 bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Brand — nama situs, link ke beranda */}
        <a
          href="/"
          className="font-libre text-lg font-bold text-primary-dark hover:opacity-60 transition-opacity duration-150"
        >
          Saintifiks
        </a>

        {/* Tombol Masuk / Keluar — hanya tampil di halaman publik */}
        {!loading && !isHalamanAdmin && (
          isLoggedIn ? (
            <button
              onClick={handleKeluar}
              aria-label="Keluar"
              className="transition-colors duration-150 hover:opacity-80"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center border border-primary-dark/10 bg-primary-dark text-primary-light transition-all duration-150 rotate-45">
                <span className="font-libre text-xl font-bold -rotate-45 leading-none">
                  {userInitial || 'U'}
                </span>
              </span>
            </button>
          ) : (
            <button
              onClick={handleMasuk}
              disabled={isLoggingIn}
              className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 disabled:opacity-50 flex items-center gap-1.5"
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
    </nav>
  )
}