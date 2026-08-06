import type { Metadata } from 'next'
import SitePageRenderer from '@/components/site-pages/SitePageRenderer'
import { privacyDefaultContent } from '@/lib/site-pages/default-content'
import { getPublishedSitePage } from '@/lib/site-pages/data'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Pusat Privasi (Draf) — Saintifiks',
  description: 'Draf Pusat Privasi Saintifiks tentang data yang diproses saat membaca, menggunakan akun, berinteraksi, dan menerbitkan konten.',
  robots: { index: false, follow: false },
}

export const revalidate = 3600

export function generateMetadata() {
  return buildSitePageMetadata('kebijakan-privasi', fallbackMetadata)
}

export default async function KebijakanPrivasiPage() {
  const publication = await getPublishedSitePage('kebijakan-privasi')
  return (
    <SitePageRenderer
      content={publication?.revision.content ?? privacyDefaultContent}
      template={publication?.page.template_key ?? 'policy'}
    />
  )
}
