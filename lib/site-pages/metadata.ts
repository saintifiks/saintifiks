import type { Metadata } from 'next'
import { getPublishedSitePage } from './data'

export async function buildSitePageMetadata(slug: string, fallback: Metadata): Promise<Metadata> {
  const publication = await getPublishedSitePage(slug)
  if (!publication) return fallback

  return {
    ...fallback,
    title: publication.revision.meta_title,
    description: publication.revision.meta_description,
    robots: {
      index: publication.revision.robots_index,
      follow: publication.revision.robots_index,
    },
    openGraph: {
      title: publication.revision.meta_title,
      description: publication.revision.meta_description,
      url: publication.page.path,
      type: 'website',
      locale: 'id_ID',
      siteName: 'Saintifiks',
    },
  }
}
