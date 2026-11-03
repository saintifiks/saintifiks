'use client'

// Komponen ThemeToggle — tombol pindah mode terang/gelap secara manual.
// Mode default mengikuti OS (di-set oleh script anti-FOUC di layout.tsx);
// pilihan manual disimpan ke localStorage dan menimpa preferensi OS.

import { useEffect, useState } from 'react'
import { IconButton } from '@/components/ui'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  // Baca tema aktif yang sudah di-set script anti-FOUC pada <html data-theme>
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as
      | 'light'
      | 'dark'
      | null
    setTheme(current ?? 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    // Pasang transisi warna sesaat agar perpindahan tema ber-fade halus,
    // lalu lepas agar tidak mengganggu interaksi lain (hover, dsb).
    root.classList.add('theme-transition')
    root.setAttribute('data-theme', next)
    localStorage.setItem('saintifiks-theme', next)
    setTheme(next)
    window.setTimeout(() => root.classList.remove('theme-transition'), 480)
  }

  // Hydration-safe: jangan render ikon sampai tema diketahui (hindari mismatch).
  // Placeholder berukuran sama untuk mencegah pergeseran layout (CLS).
  if (theme === null) return <div className="h-11 w-11" aria-hidden="true" />

  return (
    <IconButton
      icon={theme === 'dark' ? 'sun' : 'moon'}
      label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      onClick={toggle}
    />
  )
}
