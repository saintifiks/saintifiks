import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Laporkan Masalah Keamanan — Saintifiks',
  description: 'Halaman Laporkan Masalah Keamanan Saintifiks.',
}

export default function KeamananPage() {
  return <UnderMaintenance title="Laporkan Masalah Keamanan" />
}
