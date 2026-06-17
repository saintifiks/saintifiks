import type { Metadata } from 'next'
import UnderMaintenance from '@/components/layout/UnderMaintenance'

export const metadata: Metadata = {
  title: 'Bagikan Ide — Saintifiks',
  description: 'Bagikan ide untuk Saintifiks.',
}

export default function BagikanIdePage() {
  return <UnderMaintenance title="Bagikan Ide" />
}
