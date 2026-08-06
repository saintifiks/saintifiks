import type { Metadata } from 'next'
import ManagedSitePage from '@/components/site-pages/ManagedSitePage'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Kebijakan Iklan — Saintifiks',
  description: 'Halaman Kebijakan Iklan Saintifiks.',
}

export const revalidate = 3600
export function generateMetadata() { return buildSitePageMetadata('kebijakan-iklan', fallbackMetadata) }

export default function KebijakanIklanPage() {
  return <ManagedSitePage slug="kebijakan-iklan" maintenanceTitle="Kebijakan Iklan" />
}
