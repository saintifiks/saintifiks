'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  Files,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  PenLine,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react'

type AdminShellProps = {
  children: ReactNode
  email?: string | null
  signOutAction: () => Promise<void>
}

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Utama',
    items: [{ label: 'Beranda', href: '/dashboard', icon: Home, exact: true }],
  },
  {
    label: 'Konten',
    items: [
      { label: 'Artikel', href: '/dashboard/artikel', icon: FileText },
      { label: 'Opinions', href: '/dashboard/opinions', icon: MessageSquareText },
      { label: 'Halaman Situs', href: '/dashboard/halaman', icon: Files },
    ],
  },
  {
    label: 'Wawasan',
    items: [{ label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 }],
  },
  {
    label: 'Bookstore',
    items: [
      { label: 'Ringkasan', href: '/dashboard/bookstore', icon: BookOpen, exact: true },
      { label: 'Penulis', href: '/dashboard/bookstore/penulis', icon: PenLine },
      { label: 'Penerbit', href: '/dashboard/bookstore/penerbit', icon: BookOpen },
    ],
  },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function Navigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navigasi admin" className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item)
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                    className={[
                      'group flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 font-interface text-sm font-medium',
                      'transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
                      active
                        ? 'bg-signal-info-surface text-interactive-primary'
                        : 'text-text-secondary hover:bg-surface-sunken/60 hover:text-text-primary',
                    ].join(' ')}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={active ? 2 : 1.75} />
                    <span>{item.label}</span>
                    {active && <ChevronRight aria-hidden="true" className="ml-auto" size={15} />}
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
    <div className="border-t border-border-default/15 pt-4">
      <p className="truncate px-3 text-xs font-medium text-text-primary" title={email ?? 'Admin'}>
        {email ?? 'Admin Saintifiks'}
      </p>
      <p className="mt-0.5 px-3 text-[11px] text-text-tertiary">Administrator</p>
      <form action={signOutAction} className="mt-3">
        <button
          type="submit"
          className="flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-surface-sunken/60 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        >
          <LogOut aria-hidden="true" size={17} />
          Keluar
        </button>
      </form>
    </div>
  )
}

export default function AdminShell({ children, email, signOutAction }: AdminShellProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

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
        className="fixed left-4 top-4 z-toast -translate-y-24 rounded bg-interactive-primary px-4 py-2 text-sm font-semibold text-text-on-inverse shadow-md transition-transform focus:translate-y-0"
      >
        Lewati navigasi admin
      </a>

      <aside className="fixed inset-y-0 left-0 z-sticky hidden w-64 border-r border-border-default/15 bg-surface-elevated lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-border-default/15 px-6">
          <Link
            href="/dashboard"
            className="font-display text-xl font-bold tracking-tight text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-interactive-primary"
          >
            Saintifiks
          </Link>
          <span className="ml-2 rounded-full bg-surface-sunken px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-text-secondary">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <Link
            href="/dashboard/artikel/baru"
            className="mb-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 py-2.5 text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
          >
            <Plus aria-hidden="true" size={17} />
            Artikel baru
          </Link>
          <Navigation pathname={pathname} />
        </div>

        <div className="px-4 pb-5">
          <AccountBlock email={email} signOutAction={signOutAction} />
        </div>
      </aside>

      <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-border-default/15 bg-surface-elevated/95 px-4 backdrop-blur lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Buka navigasi admin"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls="admin-mobile-navigation"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        >
          <Menu aria-hidden="true" size={22} />
        </button>
        <Link href="/dashboard" className="font-display text-lg font-bold text-text-primary">
          Saintifiks <span className="font-interface text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Admin</span>
        </Link>
        <Link
          href="/dashboard/artikel/baru"
          aria-label="Buat artikel baru"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-interactive-primary text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        >
          <Plus aria-hidden="true" size={19} />
        </Link>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi admin"
            className="absolute inset-0 bg-surface-overlay/55"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            id="admin-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi admin"
            className="relative flex h-full w-[min(88vw,320px)] flex-col bg-surface-elevated shadow-lg"
          >
            <div className="flex h-16 items-center justify-between border-b border-border-default/15 px-5">
              <span className="font-display text-lg font-bold">Saintifiks</span>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Tutup navigasi"
                onClick={() => setDrawerOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
              >
                <X aria-hidden="true" size={21} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <Link
                href="/dashboard/artikel/baru"
                onClick={() => setDrawerOpen(false)}
                className="mb-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 py-3 text-sm font-semibold text-text-on-inverse"
              >
                <Plus aria-hidden="true" size={18} />
                Artikel baru
              </Link>
              <Navigation pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="px-4 pb-5">
              <AccountBlock email={email} signOutAction={signOutAction} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <div id="admin-page-content" tabIndex={-1} className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  )
}
