// Pratinjau Editorial Studio (StudioLab) dengan dokumen contoh bawaan — tanpa login dan tanpa database.
// Hanya lokal dan preview Vercel (404 di produksi). Simpan/terbitkan akan gagal (tidak ada admin).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import StudioLab from '@/components/editorial-studio/StudioLab'

export const metadata: Metadata = { title: 'Pratinjau Studio', robots: { index: false, follow: false } }

export default function StudioPreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()
  return <StudioLab />
}
