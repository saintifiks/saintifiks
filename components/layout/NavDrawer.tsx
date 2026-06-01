'use client'

// Navigation Drawer — slide-in menu ala NYT
// [IMPROVEMENT] Hamburger menu untuk navigasi mobile yang lebih organized

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Home, PenLine, Info, Shield } from 'lucide-react'

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const navSections = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/opinions', label: 'Opinions', icon: PenLine },
  { href: '/tentang', label: 'Tentang', icon: Info },
  { href: '/standar-editorial', label: 'Standar Editorial', icon: Shield },
]

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  // Escape key handler untuk accessibility
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll saat drawer terbuka
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <nav
        className={`fixed inset-y-0 left-0 z-[60] flex flex-col bg-paper dark:bg-night h-full w-80 border-r border-ink/10 dark:border-paper/10 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi utama"
        role="navigation"
      >
        {/* Header drawer */}
        <div className="p-6 border-b border-ink/10 dark:border-paper/10 flex justify-between items-center">
          <span className="font-display text-xl font-bold text-ink dark:text-paper">
            Menu
          </span>
          <button
            onClick={onClose}
            className="text-ink dark:text-paper hover:opacity-70 transition-opacity p-1"
            aria-label="Tutup menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-4">
          {navSections.map((section, index) => {
            const Icon = section.icon
            const isActive = index === 0 // Beranda aktif sebagai default
            return (
              <Link
                key={section.href}
                href={section.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-6 py-3.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-ink dark:text-paper font-semibold bg-ink/5 dark:bg-paper/5'
                    : 'text-warm-gray hover:text-ink dark:hover:text-paper hover:bg-ink/5 dark:hover:bg-paper/5'
                }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="font-interface text-base">{section.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Footer drawer */}
        <div className="p-6 border-t border-ink/10 dark:border-paper/10">
          <p className="font-interface text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Saintifiks
          </p>
        </div>
      </nav>
    </>
  )
}
