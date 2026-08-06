import type { Metadata } from 'next'
import ManagedSitePage from '@/components/site-pages/ManagedSitePage'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Kontak — Saintifiks',
  description: 'Halaman Kontak Saintifiks.',
}

export const revalidate = 3600
export function generateMetadata() { return buildSitePageMetadata('kontak', fallbackMetadata) }

export default function KontakPage() {
  return <ManagedSitePage slug="kontak" maintenanceTitle="Kontak" />
}
