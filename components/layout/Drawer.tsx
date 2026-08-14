'use client'

// Drawer — menu navigasi utama yang turun dari atas layar (full screen).
// Berisi: wordmark + tombol tutup, accordion lokasi (posisi terkini / Global /
// Cari Negara A–Z), dan tautan navigasi utama.
//
// Animasi: panel turun dari atas (cepat di awal, melambat menjelang bawah —
// cubic-bezier ease-out), konten muncul bertahap (wordmark dulu, lalu isi).

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocationSelection, GLOBAL } from '@/components/layout/LocationProvider'
import { groupCountriesByLetter } from '@/lib/countries'

type DrawerProps = {
  open: boolean
  onClose: () => void
}

// Tautan navigasi utama (format besar 40px, sesuai spesifikasi).
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'Argumen', href: '/opinions' },
  { label: 'Akun', href: '/akun' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Koreksi', href: '/koreksi' },
  { label: 'Bookstore', href: '/bookstore' },
  { label: 'Bagikan Ide', href: '/bagikan-ide' },
]

export default function Drawer({ open, onClose }: DrawerProps) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  const { detected, selected, setSelected } = useLocationSelection()
  const supabase = useMemo(() => createClient(), [])
  const countryGroups = useMemo(() => groupCountriesByLetter(), [])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Pantau status login untuk menampilkan opsi "Keluar".
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Kelola mount/unmount agar animasi keluar sempat diputar.
  useEffect(() => {
    if (open) {
      if (!mounted) {
        returnFocusRef.current = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
        setMounted(true)
      }
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      const t = setTimeout(() => {
        setMounted(false)
        setClosing(false)
        setLocationOpen(false)
        setCountryOpen(false)
      }, 260)
      return () => clearTimeout(t)
    }
  }, [open, mounted])

  // Kelola fokus keyboard, Escape, dan scroll selama drawer terpasang.
  useEffect(() => {
    if (!mounted) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    closeButtonRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), summary:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => !element.closest('[aria-hidden="true"]'))

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)

      const returnTarget = returnFocusRef.current
      if (returnTarget?.isConnected) returnTarget.focus()
      returnFocusRef.current = null
    }
  }, [mounted])

  async function handleKeluar() {
    await supabase.auth.signOut()
    onClose()
    window.location.href = '/'
  }

  function chooseLocation(value: string) {
    setSelected(value)
    onClose()
  }

  if (!mounted) return null

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-modal bg-surface-page overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
      tabIndex={-1}
    >
      <div
        className={`drawer-panel min-h-full px-5 pt-6 pb-16 ${closing ? 'drawer-panel-closing' : ''}`}
      >
        {/* Baris atas: wordmark + tombol tutup */}
        <div className="drawer-row drawer-row-1 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center font-display text-[24px] font-bold leading-none text-ink"
          >
            Saintifiks
          </Link>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-primary hover:opacity-60 transition-opacity duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
          >
            <X size={28} strokeWidth={1.75} />
          </button>
        </div>

        {/* Konten utama drawer — muncul setelah wordmark */}
        <div className="drawer-row drawer-row-2 mt-8">
          {/* Accordion lokasi */}
          <div>
            <button
              onClick={() => setLocationOpen((v) => !v)}
              aria-expanded={locationOpen}
              aria-controls="drawer-location-options"
              className="flex min-h-[44px] items-center gap-6 text-left"
            >
              <span className="font-display text-[40px] font-medium leading-tight text-ink">
                {selected}
              </span>
              <ChevronRight
                size={28}
                strokeWidth={2}
                className={`text-ink transition-transform duration-200 ${locationOpen ? 'rotate-90' : ''}`}
              />
            </button>

            <div
              id="drawer-location-options"
              className={`accordion ${locationOpen ? 'accordion-open' : ''}`}
              aria-hidden={!locationOpen}
            >
              <div className="accordion-inner">
              <div className="mt-4 flex flex-col gap-4">
                {/* Posisi terkini (terdeteksi otomatis) */}
                <button
                  onClick={() => chooseLocation(detected)}
                  tabIndex={locationOpen ? 0 : -1}
                  className="flex min-h-[44px] items-center text-left font-display text-[24px] leading-tight text-text-link"
                >
                  {detected}
                </button>

                {/* Global */}
                <button
                  onClick={() => chooseLocation(GLOBAL)}
                  tabIndex={locationOpen ? 0 : -1}
                  className="flex min-h-[44px] items-center text-left font-display text-[24px] leading-tight text-ink"
                >
                  {GLOBAL}
                </button>

                {/* Cari Negara — buka daftar A–Z */}
                <button
                  onClick={() => setCountryOpen((v) => !v)}
                  aria-expanded={countryOpen}
                  aria-controls="drawer-country-options"
                  tabIndex={locationOpen ? 0 : -1}
                  className="flex min-h-[44px] items-center gap-6 text-left"
                >
                  <span className="font-display text-[24px] leading-tight text-warm-gray">
                    Cari Negara
                  </span>
                  <ChevronRight
                    size={22}
                    strokeWidth={2}
                    className={`text-warm-gray transition-transform duration-200 ${countryOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Daftar negara A–Z — tetap ter-mount agar posisi scroll terjaga.
                    Animasi buka/tutup mulus via .accordion; overscroll-contain
                    membuat hanya area ini yang ikut tergulir. */}
                <div
                  id="drawer-country-options"
                  className={`accordion ${countryOpen ? 'accordion-open' : ''}`}
                  aria-hidden={!locationOpen || !countryOpen}
                >
                  <div className="accordion-inner">
                  <div className="max-h-[50vh] overflow-y-auto overscroll-contain pr-2 flex flex-col gap-4 pt-1">
                    {countryGroups.map((group) => (
                      <div key={group.letter}>
                        <p className="font-mono text-kicker uppercase text-warm-gray mb-2">
                          {group.letter}
                        </p>
                        <div className="flex flex-col gap-2">
                          {group.items.map((name) => (
                            <button
                              key={name}
                              onClick={() => chooseLocation(name)}
                              tabIndex={locationOpen && countryOpen ? 0 : -1}
                              className={`flex min-h-[44px] items-center text-left font-display text-[16px] leading-tight transition-colors duration-150 ${
                                selected === name ? 'text-text-link' : 'text-ink hover:text-text-link'
                              }`}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Navigasi utama */}
          <nav className="mt-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex min-h-[44px] items-center font-display text-[40px] font-medium leading-tight text-ink hover:text-text-link transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}

            {/* Keluar — hanya tampil saat sudah login (menjaga fungsi logout) */}
            {isLoggedIn && (
              <button
                onClick={handleKeluar}
                className="mt-2 flex min-h-[44px] items-center text-left font-interface text-sm text-warm-gray hover:text-ink transition-colors duration-150"
              >
                Keluar
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
