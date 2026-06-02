import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Kebijakan Iklan — Saintifiks',
  description: 'Halaman Kebijakan Iklan Saintifiks.',
}

export default function KebijakanIklanPage() {
  return <UnderMaintenance title="Kebijakan Iklan" />
}
