'use client'

// ConditionalIndexStrip — wrapper Client Component untuk IndexStrip
// Tujuan: memastikan IndexStrip hanya muncul di halaman beranda (/),
// meskipun komponen ini dipasang di layout.tsx yang berlaku di semua halaman.
//
// Pola Next.js App Router: IndexStrip (Server Component) tidak bisa di-import
// langsung di dalam Client Component. Solusinya: Server Component dilempar
// sebagai prop `strip` dari layout.tsx, lalu Client Component ini memutuskan
// apakah prop itu ditampilkan atau tidak berdasarkan pathname.

import { usePathname } from 'next/navigation'

interface Props {
  strip: React.ReactNode
}

export default function ConditionalIndexStrip({ strip }: Props) {
  const pathname = usePathname()

  // Hanya tampilkan di halaman beranda
  if (pathname !== '/') return null

  return <>{strip}</>
}
