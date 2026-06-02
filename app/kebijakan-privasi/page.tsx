import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — Saintifiks',
  description: 'Halaman Kebijakan Privasi Saintifiks.',
}

export default function KebijakanPrivasiPage() {
  return <UnderMaintenance title="Kebijakan Privasi" />
}
