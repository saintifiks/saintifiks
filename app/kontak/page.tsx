import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Kontak — Saintifiks',
  description: 'Halaman Kontak Saintifiks.',
}

export default function KontakPage() {
  return <UnderMaintenance title="Kontak" />
}
