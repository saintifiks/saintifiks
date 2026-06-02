'use client'

// LocationProvider — menyimpan pilihan lokasi (relevansi konten) yang dipakai
// bersama oleh Drawer (mengatur) dan Halaman Utama (membaca untuk memfilter).
//
// State:
// - detected: lokasi terdeteksi otomatis dari perangkat (default Indonesia).
//   Dipakai sebagai opsi "posisi terkini" di accordion.
// - selected: pilihan aktif — bisa berupa nama negara, atau 'Global'.
//   Disimpan ke localStorage agar bertahan antar kunjungan.
//
// Catatan privasi (selaras misi): deteksi murni di sisi klien lewat zona waktu/
// bahasa perangkat — TIDAK memakai layanan pelacak pihak ketiga.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const GLOBAL = 'Global'
const STORAGE_KEY = 'saintifiks-location'

type LocationContextValue = {
  detected: string
  selected: string
  setSelected: (value: string) => void
  ready: boolean
}

const LocationContext = createContext<LocationContextValue | null>(null)

// Tebak negara dari zona waktu perangkat (heuristik ringan, tanpa pihak ketiga).
function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/Jakarta|Pontianak|Makassar|Jayapura/i.test(tz)) return 'Indonesia'
    const tzToCountry: Record<string, string> = {
      'Asia/Kuala_Lumpur': 'Malaysia',
      'Asia/Singapore': 'Singapura',
      'Asia/Bangkok': 'Thailand',
      'Asia/Manila': 'Filipina',
      'Asia/Tokyo': 'Jepang',
      'Asia/Shanghai': 'Tiongkok',
      'Asia/Kolkata': 'India',
      'Europe/London': 'Britania Raya',
      'America/New_York': 'Amerika Serikat',
      'America/Los_Angeles': 'Amerika Serikat',
      'Australia/Sydney': 'Australia',
    }
    if (tzToCountry[tz]) return tzToCountry[tz]
  } catch {
    // abaikan — pakai default
  }
  return 'Indonesia'
}

export default function LocationProvider({ children }: { children: React.ReactNode }) {
  const [detected, setDetected] = useState('Indonesia')
  const [selected, setSelectedState] = useState('Indonesia')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auto = detectCountry()
    setDetected(auto)
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      stored = null
    }
    setSelectedState(stored || auto)
    setReady(true)
  }, [])

  const setSelected = (value: string) => {
    setSelectedState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // abaikan bila localStorage tidak tersedia
    }
  }

  const value = useMemo(
    () => ({ detected, selected, setSelected, ready }),
    [detected, selected, ready]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocationSelection(): LocationContextValue {
  const ctx = useContext(LocationContext)
  if (!ctx) {
    // Fallback aman bila dipakai di luar provider (mis. saat pengetesan).
    return { detected: 'Indonesia', selected: 'Indonesia', setSelected: () => {}, ready: false }
  }
  return ctx
}
