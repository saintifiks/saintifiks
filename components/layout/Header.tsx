'use client'

// Header — kepala situs global (menggantikan Navbar lama).
// Tata letak: ikon tema (matahari/bulan) mentok kiri, wordmark selalu di tengah,
// ikon menu (drawer) mentok kanan. Membuka Drawer navigasi saat ikon menu ditekan.

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import ThemeToggle from '@/components/layout/ThemeToggle'
import Drawer from '@/components/layout/Drawer'

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <header className="bg-surface-page sticky top-0 z-sticky">
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <ThemeToggle />
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="font-display text-2xl font-bold leading-none text-text-primary hover:opacity-60 transition-opacity duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
            >
              Saintifiks
            </Link>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-primary hover:opacity-60 transition-opacity duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
            >
              <Menu size={26} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  )
}
