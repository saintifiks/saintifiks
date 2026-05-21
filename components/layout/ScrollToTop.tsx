'use client'

// ScrollToTop — memaksa browser scroll ke paling atas setiap kali halaman berubah
// Dipasang di layout.tsx agar berlaku di seluruh halaman.
//
// Tanpa ini, Next.js App Router kadang mempertahankan posisi scroll
// dari halaman sebelumnya saat pengguna berpindah halaman.

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Komponen ini tidak merender elemen apapun — hanya menjalankan efek samping
  return null
}
