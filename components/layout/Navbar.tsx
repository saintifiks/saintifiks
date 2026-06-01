'use client'

// Komponen Navbar — navigasi utama situs Saintifiks
// [IMPROVEMENT] NYT-style layout: hamburger left, brand center, user right

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NavDrawer from './NavDrawer'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  // Track scroll untuk shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Sembunyikan auth buttons di halaman admin dan halaman login
  const isHalamanAdmin =
    pathname.startsWith('/dashboard') || pathname === '/login'

  return (
    <>
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-paper dark:bg-night border-b border-ink/10 dark:border-paper/10 transition-shadow duration-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Kiri: Hamburger menu */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-ink dark:text-paper hover:opacity-70 transition-opacity p-1 -ml-1"
            aria-label="Buka menu navigasi"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Tengah: Brand/wordmark */}
          <Link
            href="/"
            className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-paper tracking-[0.04em] hover:opacity-60 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2"
          >
            Saintifiks
          </Link>

          {/* Kanan: User icon / Login */}
          <div className="flex items-center">
            {!loading && !isHalamanAdmin && (
              isLoggedIn ? (
                <Link
                  href="/akun"
                  aria-label="Akun saya"
                  className="transition-opacity duration-150 hover:opacity-80"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center border border-ink/10 bg-ink text-paper dark:bg-paper dark:text-ink transition-all duration-150 rotate-45">
                    <span className="font-display text-lg font-bold -rotate-45 leading-none">
                      {userInitial || 'U'}
                    </span>
                  </span>
                </Link>
              ) : (
                <button
                  onClick={handleMasuk}
                  disabled={isLoggingIn}
                  className="text-ink dark:text-paper hover:opacity-70 transition-opacity disabled:opacity-50 p-1"
                  aria-label="Masuk"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center border border-ink/10 bg-ink text-paper dark:bg-paper dark:text-ink transition-all duration-150 rotate-45">
                      <span className="font-display text-lg font-bold -rotate-45 leading-none">
                        M
                      </span>
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Spacer untuk fixed header */}
      <div className="h-14" />
    </>
  )
}