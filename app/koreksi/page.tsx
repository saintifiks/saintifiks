import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Sampaikan Koreksi — Saintifiks',
  description: 'Halaman Sampaikan Koreksi Saintifiks.',
}

export default function KoreksiPage() {
  return <UnderMaintenance title="Sampaikan Koreksi" />
}
