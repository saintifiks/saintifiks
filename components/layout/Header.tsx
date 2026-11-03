'use client'

// Header — kepala situs global.
// Desktop (≥1024px): navigasi utama di kiri, wordmark di tengah, tema · akun · menu di kanan.
// Mobile: wordmark di tengah, tema dan menu di kanan. Menu (Drawer) memuat semua tautan dan pilihan lokasi.

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from '@/components/ui/Link'
import { IconButton } from '@/components/ui'
import ThemeToggle from '@/components/layout/ThemeToggle'
import Drawer from '@/components/layout/Drawer'
import Wordmark from '@/components/layout/Wordmark'
import AccountLink from '@/components/layout/AccountLink'

const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: 'Argumen', href: '/opinions' },
  { label: 'Koreksi', href: '/koreksi' },
  { label: 'Tentang', href: '/tentang-kami' },
]

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  if (pathname.startsWith('/dashboard')) return null

  return (
    <header className="sticky top-0 z-sticky border-b border-border-default/15 bg-surface-page">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 lg:h-[72px] lg:px-8">
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} variant="nav">
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="lg:hidden" />

        <div className="justify-self-center">
          <Wordmark />
        </div>

        <div className="flex items-center justify-end gap-1 lg:gap-3">
          <AccountLink className="hidden lg:inline-block" />
          <ThemeToggle />
          <IconButton
            icon="menu"
            label="Buka menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  )
}
