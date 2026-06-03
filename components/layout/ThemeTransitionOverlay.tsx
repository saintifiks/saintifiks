'use client'

// ThemeTransitionOverlay — overlay smooth saat toggle theme.
// Muncul dari tengah dengan efek scale + fade, menutupi flickering,
// lalu hilang setelah theme berubah. Durasi total ~700ms.

import { useEffect, useState } from 'react'

export default function ThemeTransitionOverlay() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Listen event custom dari ThemeToggle
    const handleTransitionStart = () => {
      setIsVisible(true)
      // Hilangkan overlay setelah 700ms
      setTimeout(() => setIsVisible(false), 700)
    }

    window.addEventListener('theme-transition-start', handleTransitionStart)
    return () => window.removeEventListener('theme-transition-start', handleTransitionStart)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      {/* Overlay dengan animasi scale dari tengah */}
      <div className="theme-overlay-animation absolute inset-0 bg-ink/95" />
    </div>
  )
}