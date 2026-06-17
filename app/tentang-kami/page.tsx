import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Tentang Kami — Saintifiks',
  description: 'Halaman Tentang Kami Saintifiks.',
}

export default function TentangKamiPage() {
  return <UnderMaintenance title="Tentang Kami" />
}
