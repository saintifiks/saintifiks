import type { Metadata } from 'next'
import SitePageRenderer from '@/components/site-pages/SitePageRenderer'
import { aboutDefaultContent } from '@/lib/site-pages/default-content'
import { getPublishedSitePage } from '@/lib/site-pages/data'
import { buildSitePageMetadata } from '@/lib/site-pages/metadata'

const fallbackMetadata: Metadata = {
  title: 'Tentang Saintifiks',
  description: 'Mengenal tujuan, cara kerja, pendanaan, penggunaan AI, dan pertanggungjawaban editorial Saintifiks.',
}

export const revalidate = 3600

export function generateMetadata() {
  return buildSitePageMetadata('tentang-kami', fallbackMetadata)
}

export default async function TentangKamiPage() {
  const publication = await getPublishedSitePage('tentang-kami')
  return (
    <SitePageRenderer
      content={publication?.revision.content ?? aboutDefaultContent}
      template={publication?.page.template_key ?? 'editorial'}
    />
  )
}
