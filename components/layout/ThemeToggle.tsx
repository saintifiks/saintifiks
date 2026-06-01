'use client'

// Komponen ThemeToggle — tombol pindah mode terang/gelap secara manual.
// Mode default mengikuti OS (di-set oleh script anti-FOUC di layout.tsx);
// pilihan manual disimpan ke localStorage dan menimpa preferensi OS.

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

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
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('saintifiks-theme', next)
    setTheme(next)
  }

  // Hydration-safe: jangan render ikon sampai tema diketahui (hindari mismatch).
  // Placeholder berukuran sama untuk mencegah pergeseran layout (CLS).
  if (theme === null) return <div className="h-9 w-9" aria-hidden="true" />

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:text-ink hover:bg-warm-gray/10 transition-colors duration-150"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
