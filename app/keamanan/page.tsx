import type { Metadata } from 'next'
import ManagedSitePage from '@/components/site-pages/ManagedSitePage'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Laporkan Masalah Keamanan — Saintifiks',
  description: 'Halaman Laporkan Masalah Keamanan Saintifiks.',
}

export const revalidate = 3600
export function generateMetadata() { return buildSitePageMetadata('keamanan', fallbackMetadata) }

export default function KeamananPage() {
  return <ManagedSitePage slug="keamanan" maintenanceTitle="Laporkan Masalah Keamanan" />
}
