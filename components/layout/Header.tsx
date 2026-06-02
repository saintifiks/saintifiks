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
    <header className="bg-paper">
      {/* Margin kiri-kanan 20px (px-5), padding atas 24px (pt-6) */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        {/* 3 kolom: kiri (tema) · tengah (wordmark) · kanan (menu) */}
        <div className="grid grid-cols-3 items-center">
          {/* Kiri — toggle mode terang/gelap */}
          <div className="flex justify-start">
            <ThemeToggle />
          </div>

          {/* Tengah — wordmark, selalu di tengah */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="font-display text-[24px] font-bold leading-none text-ink hover:opacity-60 transition-opacity duration-150"
            >
              Saintifiks
            </Link>
          </div>

          {/* Kanan — tombol buka drawer */}
          <div className="flex justify-end">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className="flex h-9 w-9 items-center justify-center text-ink hover:opacity-60 transition-opacity duration-150"
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
