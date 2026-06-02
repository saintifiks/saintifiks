import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Bookstore — Saintifiks',
  description: 'Toko buku Saintifiks.',
}

export default function BookstorePage() {
  return <UnderMaintenance title="Bookstore" description="Toko buku Saintifiks sedang dalam pemeliharaan. Kami sedang menyiapkannya — silakan kembali lagi nanti." />
}
