import Link from 'next/link'
import { ArrowRight, Database, Files } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
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
        <section role="alert" className="mb-6 rounded-lg border border-signal-warning/35 bg-signal-warning-surface p-5">
          <div className="flex gap-3">
            <Database aria-hidden="true" className="mt-0.5 shrink-0 text-signal-warning" size={20} />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Database CMS belum siap</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Jalankan migrasi <span className="font-mono text-xs">20260806190000_site_pages_cms.sql</span> di Supabase. Halaman publik yang sudah ada tetap aman memakai konten bawaan.
              </p>
              <p className="mt-2 font-mono text-[11px] text-text-tertiary">{error}</p>
            </div>
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary"><span className="font-semibold tabular-nums text-text-primary">{sitePageDefinitions.length}</span> halaman terdaftar</p>
        <p className="text-xs text-text-tertiary">Template visual dikunci oleh kode</p>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {sitePageDefinitions.map((definition) => {
          const page = pagesBySlug.get(definition.slug)
          const status = page ? statusFor(page) : { label: 'Setup diperlukan', variant: 'warning' as const }
          return (
            <li key={definition.slug} className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Files aria-hidden="true" className="text-text-tertiary" size={17} />
                    <h2 className="font-display text-lg font-bold text-text-primary">{definition.name}</h2>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-text-tertiary">{definition.path}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{definition.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border-default/10 pt-4">
                <span className="text-xs capitalize text-text-tertiary">Template {definition.template}</span>
                {page ? (
                  <Link href={`/dashboard/halaman/${definition.slug}`} className="inline-flex min-h-[40px] items-center gap-2 rounded px-2 text-sm font-semibold text-text-link hover:bg-signal-info-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">
                    Kelola <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                ) : <span className="text-xs font-medium text-text-tertiary">Belum tersedia</span>}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
