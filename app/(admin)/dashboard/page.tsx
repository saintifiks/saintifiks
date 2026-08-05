import Link from 'next/link'
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Clock3, FileText, MessageSquareText, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

type Article = {
  id: string
  title: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, is_published, published_at, created_at')
    .order('created_at', { ascending: false })

  const daftarArtikel: Article[] = articles ?? []
  const drafts = daftarArtikel.filter((article) => !article.is_published)
  const published = daftarArtikel.filter((article) => article.is_published)
  const latest = daftarArtikel.slice(0, 5)

  return (
    <main aria-labelledby="dashboard-title">
      <PageHeader
        titleId="dashboard-title"
        eyebrow="Ruang kerja"
        title="Beranda"
        description="Pusat kendali untuk melanjutkan pekerjaan editorial dan membuka area yang memerlukan perhatian."
        actions={
          <Link
            href="/dashboard/artikel/baru"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 py-2.5 text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
          >
            <Plus aria-hidden="true" size={17} />
            Artikel baru
          </Link>
        }
      />

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-signal-danger/30 bg-signal-danger-surface px-4 py-3 text-sm text-signal-danger">
          Data artikel belum dapat dimuat. Coba muat ulang halaman.
        </div>
      )}

      <section aria-labelledby="overview-heading" className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Ringkasan</p>
            <h2 id="overview-heading" className="mt-1 text-base font-semibold text-text-primary">Kondisi konten saat ini</h2>
          </div>
          <Link href="/dashboard/artikel" className="hidden items-center gap-1 text-sm font-medium text-text-link hover:underline sm:flex">
            Semua artikel <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">Perlu dilanjutkan</p>
              <Clock3 aria-hidden="true" size={18} className="text-signal-warning" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">{drafts.length}</p>
            <p className="mt-1 text-xs text-text-tertiary">Artikel berstatus draf</p>
          </div>

          <div className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">Sudah terbit</p>
              <CheckCircle2 aria-hidden="true" size={18} className="text-signal-success" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">{published.length}</p>
            <p className="mt-1 text-xs text-text-tertiary">Artikel tersedia untuk publik</p>
          </div>

          <div className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">Total artikel</p>
              <FileText aria-hidden="true" size={18} className="text-interactive-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">{daftarArtikel.length}</p>
            <p className="mt-1 text-xs text-text-tertiary">Draf dan artikel terbit</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <section aria-labelledby="draft-heading" className="rounded-lg border border-border-default/15 bg-surface-elevated">
          <div className="flex items-center justify-between border-b border-border-default/15 px-5 py-4">
            <div>
              <h2 id="draft-heading" className="text-base font-semibold text-text-primary">Lanjutkan draf</h2>
              <p className="mt-0.5 text-xs text-text-tertiary">Pekerjaan editorial yang belum diterbitkan</p>
            </div>
            <Badge>{drafts.length}</Badge>
          </div>

          {drafts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 aria-hidden="true" className="mx-auto text-signal-success" size={26} />
              <p className="mt-3 text-sm font-medium text-text-primary">Tidak ada draf tertunda</p>
              <p className="mt-1 text-xs text-text-tertiary">Semua artikel sudah diterbitkan.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-default/10">
              {drafts.slice(0, 5).map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/dashboard/artikel/${article.id}/edit`}
                    className="group flex min-h-[68px] items-center justify-between gap-4 px-5 py-3 hover:bg-surface-sunken/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-interactive-primary"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary group-hover:text-text-link">{article.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
                        <Clock3 aria-hidden="true" size={12} />
                        Dibuat {formatTanggal(article.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-text-link">Lanjutkan</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {drafts.length > 5 && (
            <div className="border-t border-border-default/15 px-5 py-3">
              <Link href="/dashboard/artikel" className="inline-flex items-center gap-1 text-xs font-medium text-text-link hover:underline">
                Lihat semua draf <ArrowRight aria-hidden="true" size={13} />
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="areas-heading" className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
          <h2 id="areas-heading" className="text-base font-semibold text-text-primary">Area kerja</h2>
          <p className="mt-1 text-xs text-text-tertiary">Buka modul sesuai pekerjaan yang ingin dilakukan.</p>

          <div className="mt-5 space-y-2">
            {[
              { href: '/dashboard/opinions', label: 'Moderasi Opinions', description: 'Tinjau laporan dan status tulisan', icon: MessageSquareText },
              { href: '/dashboard/analytics', label: 'Analytics', description: 'Evaluasi performa konten', icon: BarChart3 },
              { href: '/dashboard/bookstore', label: 'Bookstore', description: 'Kelola buku, penulis, dan penerbit', icon: BookOpen },
            ].map((area) => {
              const Icon = area.icon
              return (
                <Link
                  key={area.href}
                  href={area.href}
                  className="group flex items-center gap-3 rounded-lg border border-transparent p-3 hover:border-border-default/15 hover:bg-surface-sunken/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-info-surface text-interactive-primary">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary">{area.label}</span>
                    <span className="block truncate text-xs text-text-tertiary">{area.description}</span>
                  </span>
                  <ArrowRight aria-hidden="true" size={15} className="text-text-tertiary group-hover:text-text-link" />
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      {latest.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Aktivitas terbaru</p>
              <h2 id="recent-heading" className="mt-1 text-base font-semibold text-text-primary">Artikel terakhir diperbarui</h2>
            </div>
            <Link href="/dashboard/artikel" className="inline-flex items-center gap-1 text-xs font-medium text-text-link hover:underline">
              Buka daftar <ArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-border-default/15 bg-surface-elevated">
            <ul className="divide-y divide-border-default/10">
              {latest.map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{article.title}</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {formatTanggal(article.published_at ?? article.created_at)}
                    </p>
                  </div>
                  <Badge variant={article.is_published ? 'success' : 'default'}>
                    {article.is_published ? 'Terbit' : 'Draf'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
