'use client'

// Komponen ThemeToggle — tombol pindah mode terang/gelap secara manual.
// Mode default mengikuti OS (di-set oleh script anti-FOUC di layout.tsx);
// pilihan manual disimpan ke localStorage dan menimpa preferensi OS.
//
// Sesi #48: Implementasi coordinated transition dengan data attribute
// untuk koordinasi dengan komponen lain (IndexStrip, dll).

import { useEffect, useState, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Baca tema aktif yang sudah di-set script anti-FOUC pada <html data-theme>
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as
      | 'light'
      | 'dark'
      | null
    setTheme(current ?? 'light')
  }, [])

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    
    // Set transitioning state untuk koordinasi dengan komponen lain
    root.setAttribute('data-theme-transitioning', 'true')
    setIsTransitioning(true)
    
    // Ubah tema
    root.setAttribute('data-theme', next)
    localStorage.setItem('saintifiks-theme', next)
    setTheme(next)
    
    // Cleanup setelah transisi selesai (300ms = sedikit lebih lama dari 280ms)
    setTimeout(() => {
      root.removeAttribute('data-theme-transitioning')
      setIsTransitioning(false)
    }, 300)
  }, [theme])

  // Hydration-safe: jangan render ikon sampai tema diketahui (hindari mismatch).
  // Placeholder berukuran sama untuk mencegah pergeseran layout (CLS).
  if (theme === null) return <div className="h-9 w-9" aria-hidden="true" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      aria-pressed={isDark}
      disabled={isTransitioning}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-full
        text-ink/60 hover:text-ink hover:bg-warm-gray/10
        theme-transition-bg
        focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-sea-deep focus-visible:ring-offset-2
        ${isTransitioning ? 'pointer-events-none' : ''}
      `}
    >
      {/* 
        KUNCI: Gunakan absolute positioning dengan opacity swap
        Ini menghindari icon "morphing" yang terlihat glitchy
      */}
      <div className="relative h-[18px] w-[18px]">
        <Sun
          size={18}
          className={`
            absolute inset-0
            theme-transition-icon
            ${isDark ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}
          `}
          aria-hidden="true"
        />
        <Moon
          size={18}
          className={`
            absolute inset-0
            theme-transition-icon
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}
          `}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}
