import Link from 'next/link'
import { notFound } from 'next/navigation'
import SitePageRenderer from '@/components/site-pages/SitePageRenderer'
import { getAdminSitePage } from '@/lib/site-pages/data'
import { getSitePageDefinition } from '@/lib/site-pages/registry'

export const dynamic = 'force-dynamic'

export default async function SitePagePreview({ params }: { params: { slug: string } }) {
  const definition = getSitePageDefinition(params.slug)
  if (!definition) notFound()
  const data = await getAdminSitePage(params.slug)
  if (!data?.draft) notFound()

  return (
    <main>
      <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-border-default/15 bg-surface-elevated px-4 py-3">
        <p className="text-sm text-text-secondary">Pratinjau {definition.name}, versi {data.draft.version}</p>
        <Link href={`/dashboard/halaman/${params.slug}`} className="text-sm font-semibold text-text-link hover:underline">Kembali ke editor</Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default/15">
        <SitePageRenderer content={data.draft.content} template={data.page.template_key} preview />
      </div>
    </main>
  )
}
