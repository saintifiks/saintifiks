import UnderMaintenance from '@/components/layout/UnderMaintenance'
import { getPublishedSitePage } from '@/lib/site-pages/data'
import SitePageRenderer from './SitePageRenderer'

export default async function ManagedSitePage({ slug, maintenanceTitle }: { slug: string; maintenanceTitle: string }) {
  const publication = await getPublishedSitePage(slug)
  if (!publication) return <UnderMaintenance title={maintenanceTitle} />
  return <SitePageRenderer content={publication.revision.content} template={publication.page.template_key} />
}
