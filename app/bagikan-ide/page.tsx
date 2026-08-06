import type { Metadata } from 'next'
import ManagedSitePage from '@/components/site-pages/ManagedSitePage'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Bagikan Ide — Saintifiks',
  description: 'Bagikan ide untuk Saintifiks.',
}

export const revalidate = 3600
export function generateMetadata() { return buildSitePageMetadata('bagikan-ide', fallbackMetadata) }

export default function BagikanIdePage() {
  return <ManagedSitePage slug="bagikan-ide" maintenanceTitle="Bagikan Ide" />
}
