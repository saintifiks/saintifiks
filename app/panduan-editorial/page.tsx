import type { Metadata } from 'next'
import ManagedSitePage from '@/components/site-pages/ManagedSitePage'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Panduan Editorial — Saintifiks',
  description: 'Halaman Panduan Editorial Saintifiks.',
}

export const revalidate = 3600
export function generateMetadata() { return buildSitePageMetadata('panduan-editorial', fallbackMetadata) }

export default function PanduanEditorialPage() {
  return <ManagedSitePage slug="panduan-editorial" maintenanceTitle="Panduan Editorial" />
}
