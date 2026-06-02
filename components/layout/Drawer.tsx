'use client'

// Drawer — menu navigasi utama yang turun dari atas layar (full screen).
// Berisi: wordmark + tombol tutup, accordion lokasi (posisi terkini / Global /
// Cari Negara A–Z), dan tautan navigasi utama.
//
// Animasi: panel turun dari atas (cepat di awal, melambat menjelang bawah —
// cubic-bezier ease-out), konten muncul bertahap (wordmark dulu, lalu isi).

import { useEffect, useMemo, useState } from 'react'
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

  const { detected, selected, setSelected } = useLocationSelection()
  const supabase = useMemo(() => createClient(), [])
  const countryGroups = useMemo(() => groupCountriesByLetter(), [])

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
      setMounted(true)
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

  // Kunci scroll body + tutup dengan tombol Escape saat drawer terbuka.
  useEffect(() => {
    if (!mounted) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

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
      className="fixed inset-0 z-[200] bg-paper overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
    >
      <div
        className={`drawer-panel min-h-full px-5 pt-6 pb-16 ${closing ? 'drawer-panel-closing' : ''}`}
      >
        {/* Baris atas: wordmark + tombol tutup */}
        <div className="drawer-row drawer-row-1 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-[24px] font-bold leading-none text-ink"
          >
            Saintifiks
          </Link>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex h-8 w-8 items-center justify-center text-ink hover:opacity-60 transition-opacity duration-150"
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
              className="flex items-center gap-6 text-left"
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

            {locationOpen && (
              <div className="mt-4 flex flex-col gap-4">
                {/* Posisi terkini (terdeteksi otomatis) */}
                <button
                  onClick={() => chooseLocation(detected)}
                  className="text-left font-display text-[24px] leading-tight text-sea-deep"
                >
                  {detected}
                </button>

                {/* Global */}
                <button
                  onClick={() => chooseLocation(GLOBAL)}
                  className="text-left font-display text-[24px] leading-tight text-ink"
                >
                  {GLOBAL}
                </button>

                {/* Cari Negara — buka daftar A–Z */}
                <button
                  onClick={() => setCountryOpen((v) => !v)}
                  aria-expanded={countryOpen}
                  className="flex items-center gap-6 text-left"
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
                    overscroll-contain: hanya area ini yang ikut tergulir. */}
                <div
                  className={countryOpen ? 'block' : 'hidden'}
                  aria-hidden={!countryOpen}
                >
                  <div className="max-h-[50vh] overflow-y-auto overscroll-contain pr-2 flex flex-col gap-4">
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
                              className={`text-left font-display text-[16px] leading-tight transition-colors duration-150 ${
                                selected === name ? 'text-sea-deep' : 'text-ink hover:text-sea-deep'
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
            )}
          </div>

          {/* Navigasi utama */}
          <nav className="mt-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="font-display text-[40px] font-medium leading-tight text-ink hover:text-sea-deep transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}

            {/* Keluar — hanya tampil saat sudah login (menjaga fungsi logout) */}
            {isLoggedIn && (
              <button
                onClick={handleKeluar}
                className="mt-2 text-left font-interface text-sm text-warm-gray hover:text-ink transition-colors duration-150"
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
