import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import { Notice, EmptyState, adminLink, focusRing, table } from '@/components/admin/ui'
import Badge from '@/components/ui/Badge'
import { formatTanggalPendek } from '@/lib/format-date'

export const dynamic = 'force-dynamic'

type Article = {
  id: string
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
  created_at: string
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
        eyebrow="Konten"
        title="Artikel"
        description="Seluruh tulisan editorial Saintifiks, dari yang terbaru."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Artikel' }]}
      />

      {error && <Notice tone="danger">Daftar artikel belum dapat dimuat. Coba muat ulang halaman.</Notice>}

      {error ? null : daftarArtikel.length === 0 ? (
        <EmptyState title="Belum ada artikel" action={{ label: 'Buat artikel pertama', href: '/dashboard/artikel/baru' }}>
          Artikel yang dibuat akan tampil di sini, lengkap dengan statusnya.
        </EmptyState>
      ) : (
        <>
          <p className="mb-3 font-mono text-caption text-text-tertiary">{daftarArtikel.length} artikel</p>

          <div className={`hidden md:block ${table.wrap}`}>
            <table className={`${table.root} table-fixed`}>
              <caption className="sr-only">Daftar seluruh artikel Saintifiks</caption>
              <thead>
                <tr className={table.headRow}>
                  <th scope="col" className={table.th}>Judul</th>
                  <th scope="col" className={`${table.th} w-36`}>Status</th>
                  <th scope="col" className={`${table.th} w-36`}>Tanggal</th>
                  <th scope="col" className={`${table.th} w-20`}><span className="sr-only">Tindakan</span></th>
                </tr>
              </thead>
              <tbody className={table.bodyRows}>
                {daftarArtikel.map((article) => (
                  <tr key={article.id}>
                    <th scope="row" className={`${table.td} font-normal`}>
                      <p className="truncate font-display text-base text-text-primary">{article.title}</p>
                      <p className="mt-1 truncate font-mono text-caption text-text-tertiary">/{article.slug}</p>
                    </th>
                    <td className={table.td}>
                      <Badge variant={article.is_published ? 'success' : 'default'}>
                        {article.is_published ? 'Terbit' : 'Draf'}
                      </Badge>
                    </td>
                    <td className={`${table.td} font-mono text-caption text-text-secondary`}>
                      {formatTanggalPendek(article.published_at ?? article.created_at)}
                    </td>
                    <td className={`${table.td} text-right`}>
                      <Link
                        href={`/dashboard/artikel/${article.id}/edit`}
                        className={`font-interface text-sm text-text-primary ${adminLink} ${focusRing}`}
                      >
                        Ubah
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border-default/15 border-y border-border-default/20 md:hidden">
            {daftarArtikel.map((article) => (
              <li key={article.id}>
                <Link href={`/dashboard/artikel/${article.id}/edit`} className={`group block py-4 ${focusRing}`}>
                  <p className="font-display text-base leading-snug text-text-primary">{article.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Badge variant={article.is_published ? 'success' : 'default'}>
                      {article.is_published ? 'Terbit' : 'Draf'}
                    </Badge>
                    <span className="font-mono text-caption text-text-tertiary">
                      {formatTanggalPendek(article.published_at ?? article.created_at)}
                    </span>
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
