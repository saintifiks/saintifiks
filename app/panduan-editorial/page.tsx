import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Panduan Editorial — Saintifiks',
  description: 'Halaman Panduan Editorial Saintifiks.',
}

export default function PanduanEditorialPage() {
  return <UnderMaintenance title="Panduan Editorial" />
}
