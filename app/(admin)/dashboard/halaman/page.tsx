import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import { Notice, adminLink, focusRing } from '@/components/admin/ui'
import Badge from '@/components/ui/Badge'
import { getAdminSitePages } from '@/lib/site-pages/data'
import { sitePageDefinitions } from '@/lib/site-pages/registry'

export const dynamic = 'force-dynamic'

function statusFor(page: { draft_revision_id: string | null; published_revision_id: string | null }) {
  if (page.draft_revision_id && page.published_revision_id) return { label: 'Perubahan belum terbit', variant: 'warning' as const }
  if (page.draft_revision_id) return { label: 'Draf', variant: 'default' as const }
  if (page.published_revision_id) return { label: 'Terbit', variant: 'success' as const }
  return { label: 'Belum dimulai', variant: 'default' as const }
}

export default async function SitePagesAdminPage() {
  const { pages, error } = await getAdminSitePages()
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]))

  return (
    <main aria-labelledby="site-pages-title">
      <PageHeader
        titleId="site-pages-title"
        eyebrow="Konten"
        title="Halaman Situs"
        description="Kelola isi halaman institusional tanpa mengubah kode atau menunggu deployment. Perubahan baru terlihat oleh pembaca setelah diterbitkan."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Halaman Situs' }]}
      />

      {error && (
        <Notice tone="danger" title="Database CMS belum siap">
          Jalankan migrasi <span className="font-mono text-caption">20260806190000_site_pages_cms.sql</span> di Supabase.
          Halaman publik yang sudah ada tetap aman memakai konten bawaan.
          <span className="mt-2 block font-mono text-caption text-text-tertiary">{error}</span>
        </Notice>
      )}

      <p className="mb-3 font-mono text-caption text-text-tertiary">
        {sitePageDefinitions.length} halaman terdaftar · template visual dikunci oleh kode
      </p>

      <ul className="divide-y divide-border-default/15 border-y border-border-default/20">
        {sitePageDefinitions.map((definition) => {
          const page = pagesBySlug.get(definition.slug)
          const status = page ? statusFor(page) : { label: 'Perlu setup', variant: 'warning' as const }
          return (
            <li key={definition.slug} className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div className="min-w-0">
                  <h2 className="font-display text-lg text-text-primary">{definition.name}</h2>
                  <p className="mt-1 font-mono text-caption text-text-tertiary">{definition.path}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="mt-3 max-w-2xl font-display text-body-sm italic leading-relaxed text-text-secondary">
                {definition.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="font-mono text-caption capitalize text-text-tertiary">Template {definition.template}</span>
                {page ? (
                  <Link
                    href={`/dashboard/halaman/${definition.slug}`}
                    className={`font-interface text-sm text-text-primary ${adminLink} ${focusRing}`}
                  >
                    Kelola
                  </Link>
                ) : (
                  <span className="font-mono text-caption text-text-tertiary">Belum tersedia</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
