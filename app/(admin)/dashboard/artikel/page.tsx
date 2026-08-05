import Link from 'next/link'
import { ArrowRight, FileText, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

type Article = {
  id: string
  title: string
  slug: string
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

export default async function ArticleIndexPage() {
  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, is_published, published_at, created_at')
    .order('created_at', { ascending: false })

  const daftarArtikel: Article[] = articles ?? []

  return (
    <main aria-labelledby="article-index-title">
      <PageHeader
        titleId="article-index-title"
        title="Artikel"
        description="Temukan, tinjau, dan lanjutkan seluruh konten editorial Saintifiks."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Artikel' }]}
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

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold tabular-nums text-text-primary">{daftarArtikel.length}</span> artikel
        </p>
        <p className="text-xs text-text-tertiary">Diurutkan dari yang terbaru</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface px-4 py-3 text-sm text-signal-danger">
          Daftar artikel belum dapat dimuat. Coba muat ulang halaman.
        </div>
      )}

      {error ? null : daftarArtikel.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-default/25 bg-surface-elevated px-6 py-16 text-center">
          <FileText aria-hidden="true" className="mx-auto text-text-tertiary" size={30} />
          <h2 className="mt-4 text-base font-semibold text-text-primary">Belum ada artikel</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">Buat artikel pertama untuk memulai ruang editorial Saintifiks.</p>
          <Link href="/dashboard/artikel/baru" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-text-link hover:underline">
            Buat artikel <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-border-default/15 bg-surface-elevated md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">Daftar seluruh artikel Saintifiks</caption>
              <thead className="bg-surface-sunken/45">
                <tr className="border-b border-border-default/15">
                  <th scope="col" className="w-auto px-5 py-3 text-xs font-semibold text-text-secondary">Judul</th>
                  <th scope="col" className="w-32 px-4 py-3 text-xs font-semibold text-text-secondary">Status</th>
                  <th scope="col" className="w-40 px-4 py-3 text-xs font-semibold text-text-secondary">Tanggal</th>
                  <th scope="col" className="w-24 px-5 py-3"><span className="sr-only">Tindakan</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/10">
                {daftarArtikel.map((article) => (
                  <tr key={article.id} className="hover:bg-surface-sunken/30">
                    <th scope="row" className="px-5 py-4">
                      <p className="truncate text-sm font-medium text-text-primary">{article.title}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-text-tertiary">/{article.slug}</p>
                    </th>
                    <td className="px-4 py-4">
                      <Badge variant={article.is_published ? 'success' : 'default'}>
                        {article.is_published ? 'Terbit' : 'Draf'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-text-secondary">
                      {formatTanggal(article.published_at ?? article.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/artikel/${article.id}/edit`}
                        className="inline-flex min-h-[36px] items-center rounded px-2 text-xs font-semibold text-text-link hover:bg-signal-info-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {daftarArtikel.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/dashboard/artikel/${article.id}/edit`}
                  className="block rounded-lg border border-border-default/15 bg-surface-elevated p-4 hover:border-border-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-sm font-semibold leading-5 text-text-primary">{article.title}</p>
                    <Badge variant={article.is_published ? 'success' : 'default'}>
                      {article.is_published ? 'Terbit' : 'Draf'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-tertiary">
                    <span>{formatTanggal(article.published_at ?? article.created_at)}</span>
                    <span className="font-medium text-text-link">Edit</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
