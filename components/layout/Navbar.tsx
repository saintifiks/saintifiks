'use client'

// Komponen Navbar — navigasi utama situs Saintifiks
// [DIUBAH SESI #15] Client Component: sebelumnya Server Component (konten statis).
// Diubah karena perlu mengecek status login pembaca untuk menampilkan tombol Masuk/Keluar.

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const supabase = createClient()

  // Cek status sesi saat komponen pertama kali dimuat
  useEffect(() => {
    async function cekSesi() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }
    cekSesi()
  }, [supabase])

  // Masuk: trigger Google OAuth, setelah selesai kembali ke halaman yang sedang dibuka
  async function handleMasuk() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${pathname}`,
      },
    })
  }

  // Keluar: akhiri sesi, arahkan ke beranda
  async function handleKeluar() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Sembunyikan tombol Masuk/Keluar di halaman admin dan halaman login.
  // Admin punya tombol Keluar sendiri di dashboard — duplikasi tidak diperlukan.
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
              className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150"
            >
              Keluar
            </button>
          ) : (
            <button
              onClick={handleMasuk}
              className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150"
            >
              Masuk
            </button>
          )
        )}

      </div>
    </nav>
  )
}
