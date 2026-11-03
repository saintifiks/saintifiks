'use client'

// AdminShell — kerangka ruang kerja admin. Desktop: bilah sisi tetap 256px. Ponsel: bilah atas + menu geser.
// Satu bahasa dengan situs publik: monokrom, sudut tajam, tanpa ikon di navigasi. Yang perlu perhatian
// ditandai angka mono di samping nama menu (mis. usulan koreksi yang menunggu), bukan warna.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Wordmark from '@/components/layout/Wordmark'
import { IconButton } from '@/components/ui'

type AdminShellProps = {
  children: ReactNode
  email?: string | null
  signOutAction: () => Promise<void>
  // Jumlah pekerjaan menunggu per alamat menu, mis. { '/dashboard/koreksi': 3 }
  pending?: Record<string, number>
}

type NavItem = {
  label: string
  href: string
  exact?: boolean
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Utama',
    items: [{ label: 'Beranda', href: '/dashboard', exact: true }],
  },
  {
    label: 'Konten',
    items: [
      { label: 'Artikel', href: '/dashboard/artikel' },
      { label: 'Koreksi', href: '/dashboard/koreksi' },
      { label: 'Argumen', href: '/dashboard/opinions' },
      { label: 'Halaman Situs', href: '/dashboard/halaman' },
    ],
  },
  {
    label: 'Wawasan',
    items: [{ label: 'Analitik', href: '/dashboard/analytics' }],
  },
  {
    label: 'Bookstore',
    items: [
      { label: 'Ringkasan', href: '/dashboard/bookstore', exact: true },
      { label: 'Penulis', href: '/dashboard/bookstore/penulis' },
      { label: 'Penerbit', href: '/dashboard/bookstore/penerbit' },
    ],
  },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'

function Navigation({
  pathname,
  pending,
  onNavigate,
}: {
  pathname: string
  pending: Record<string, number>
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Navigasi admin" className="space-y-7">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-tertiary">
            {group.label}
          </p>
          <ul>
            {group.items.map((item) => {
              const active = isActive(pathname, item)
              const count = pending[item.href] ?? 0

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                    className={[
                      'flex min-h-[40px] items-center justify-between gap-3 border-l py-2 pl-4 pr-1 font-interface text-sm',
                      'transition-colors duration-fast',
                      focusRing,
                      active
                        ? 'border-text-primary font-semibold text-text-primary'
                        : 'border-border-default/20 text-text-secondary hover:border-text-primary hover:text-text-primary',
                    ].join(' ')}
                  >
                    <span>{item.label}</span>
                    {count > 0 && (
                      <span
                        className="font-mono text-caption tabular-nums text-text-primary"
                        aria-label={`${count} menunggu`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function AccountBlock({ email, signOutAction }: Pick<AdminShellProps, 'email' | 'signOutAction'>) {
  return (
    <div className="border-t border-border-default/20 pt-4">
      <p className="truncate font-mono text-caption text-text-secondary" title={email ?? 'Admin'}>
        {email ?? 'Admin Saintifiks'}
      </p>
      <form action={signOutAction} className="mt-2">
        <button
          type="submit"
          className={`min-h-[40px] font-interface text-sm text-text-primary underline decoration-text-primary/35 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary ${focusRing}`}
        >
          Keluar
        </button>
      </form>
    </div>
  )
}

const newArticleClass = `flex min-h-[44px] w-full items-center justify-center bg-interactive-primary px-4 font-interface text-caption-lg font-semibold uppercase tracking-widest text-text-on-inverse transition-colors duration-fast hover:bg-interactive-primary-hover ${focusRing}`

export default function AdminShell({ children, email, signOutAction, pending = {} }: AdminShellProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const totalPending = Object.values(pending).reduce((a, b) => a + b, 0)

  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLElement>('a[href], button')?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      menuButton?.focus()
    }
  }, [drawerOpen])

  return (
    <div className="min-h-screen bg-surface-page font-interface text-text-primary">
      <a
        href="#admin-page-content"
        className="fixed left-4 top-4 z-toast -translate-y-24 bg-interactive-primary px-4 py-2 text-sm font-semibold text-text-on-inverse transition-transform focus:translate-y-0"
      >
        Lewati navigasi admin
      </a>

      <aside className="fixed inset-y-0 left-0 z-sticky hidden w-64 border-r border-border-default/20 bg-surface-page lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-border-default/20 px-6">
          <Wordmark href="/dashboard" label="Beranda admin" />
          <span className="font-mono text-caption uppercase tracking-widest text-text-tertiary">Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Link href="/dashboard/artikel/baru" className={`${newArticleClass} mb-8`}>
            Artikel baru
          </Link>
          <Navigation pathname={pathname} pending={pending} />
        </div>

        <div className="px-6 pb-5">
          <AccountBlock email={email} signOutAction={signOutAction} />
        </div>
      </aside>

      <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-border-default/20 bg-surface-page px-2 lg:hidden">
        <IconButton
          ref={menuButtonRef}
          icon="menu"
          label={totalPending > 0 ? `Buka navigasi admin, ${totalPending} menunggu` : 'Buka navigasi admin'}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls="admin-mobile-navigation"
          onClick={() => setDrawerOpen(true)}
        />
        <Wordmark href="/dashboard" label="Beranda admin" />
        <Link
          href="/dashboard/artikel/baru"
          className={`flex min-h-[44px] items-center px-3 font-interface text-caption-lg font-semibold uppercase tracking-widest text-text-primary underline decoration-text-primary/35 decoration-1 underline-offset-[6px] ${focusRing}`}
        >
          Baru
        </Link>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi admin"
            className="absolute inset-0 bg-night/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            id="admin-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi admin"
            className="relative flex h-full w-[min(88vw,320px)] flex-col border-r border-border-default/30 bg-surface-page"
          >
            <div className="flex h-16 items-center justify-between border-b border-border-default/20 pl-6 pr-1">
              <span className="font-mono text-caption uppercase tracking-widest text-text-tertiary">Admin</span>
              <IconButton icon="close" label="Tutup navigasi" onClick={() => setDrawerOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <Link
                href="/dashboard/artikel/baru"
                onClick={() => setDrawerOpen(false)}
                className={`${newArticleClass} mb-8`}
              >
                Artikel baru
              </Link>
              <Navigation pathname={pathname} pending={pending} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="px-6 pb-5">
              <AccountBlock email={email} signOutAction={signOutAction} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <div
          id="admin-page-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1200px] px-4 py-7 focus:outline-none sm:px-6 sm:py-9 lg:px-10 lg:py-12"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
