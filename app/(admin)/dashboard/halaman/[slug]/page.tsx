import { notFound } from 'next/navigation'
import PageHeader from '@/components/admin/PageHeader'
import SitePageEditor from '@/components/admin/site-pages/SitePageEditor'
import { getAdminSitePage } from '@/lib/site-pages/data'
import { getDefaultSitePageContent } from '@/lib/site-pages/default-content'
import { sitePageMetaDefaults } from '@/lib/site-pages/meta-defaults'
import { getSitePageDefinition } from '@/lib/site-pages/registry'

export const dynamic = 'force-dynamic'

export default async function SitePageEditPage({ params }: { params: { slug: string } }) {
  const definition = getSitePageDefinition(params.slug)
  if (!definition) notFound()

  const data = await getAdminSitePage(params.slug)
  if (!data) notFound()

  const defaults = getDefaultSitePageContent(params.slug)
  const metaDefaults = sitePageMetaDefaults[params.slug]
  const editable = data.draft ?? data.published
  if (!editable && (!defaults || !metaDefaults)) notFound()

  return (
    <main aria-labelledby="site-page-editor-title">
      <PageHeader
        titleId="site-page-editor-title"
        eyebrow="Halaman Situs"
        title={definition.name}
        description="Susun isi dalam bagian dan blok terstruktur. Desain, keamanan, serta fungsi halaman tetap dijaga oleh kode."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Halaman Situs', href: '/dashboard/halaman' }, { label: definition.name }]}
      />
      <SitePageEditor
        key={data.page.draft_revision_id ?? data.page.published_revision_id ?? 'default'}
        pageId={data.page.id}
        slug={data.page.slug}
        publicPath={data.page.path}
        initialContent={editable?.content ?? defaults!}
        initialMetaTitle={editable?.meta_title ?? metaDefaults.title}
        initialMetaDescription={editable?.meta_description ?? metaDefaults.description}
        initialRobotsIndex={editable?.robots_index ?? metaDefaults.robotsIndex}
        initialDraftId={data.page.draft_revision_id}
        publishedRevisionId={data.page.published_revision_id}
        requiredSectionIds={definition.requiredSectionIds}
        history={data.history}
      />
    </main>
  )
}
