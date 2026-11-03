import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import { EmptyState, sectionTitle, table } from '@/components/admin/ui'
import QuickAddForm from '@/components/bookstore/admin/QuickAddForm'

export const dynamic = 'force-dynamic'

export default async function PenulisAdminPage() {
  const supabase = await createClient()
  const { data: authors } = await supabase.from('authors').select('*').order('created_at', { ascending: false })
  const daftarPenulis = authors ?? []

  return (
    <main aria-labelledby="penulis-title">
      <PageHeader
        titleId="penulis-title"
        eyebrow="Bookstore"
        title="Penulis"
        description="Penulis buku di katalog. Tambahkan penulis sebelum membuat buku."
        breadcrumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Bookstore', href: '/dashboard/bookstore' },
          { label: 'Penulis' },
        ]}
      />

      <div className="grid items-start gap-12 md:grid-cols-[300px_1fr]">
        <section aria-labelledby="tambah-heading">
          <h2 id="tambah-heading" className={`mb-5 ${sectionTitle}`}>
            Tambah penulis
          </h2>
          <QuickAddForm kind="penulis" />
        </section>

        <section aria-labelledby="daftar-heading">
          <h2 id="daftar-heading" className={`mb-4 ${sectionTitle}`}>
            Daftar · {daftarPenulis.length}
          </h2>
          {daftarPenulis.length === 0 ? (
            <EmptyState title="Belum ada penulis" />
          ) : (
            <div className={table.wrap}>
              <table className={table.root}>
                <caption className="sr-only">Daftar penulis buku</caption>
                <thead>
                  <tr className={table.headRow}>
                    <th scope="col" className={table.th}>Nama</th>
                    <th scope="col" className={table.th}>Biografi</th>
                  </tr>
                </thead>
                <tbody className={table.bodyRows}>
                  {daftarPenulis.map((author) => (
                    <tr key={author.id}>
                      <th scope="row" className={`${table.td} font-display text-base font-normal text-text-primary`}>
                        {author.name}
                      </th>
                      <td className={`${table.td} line-clamp-2 font-display text-body-sm italic text-text-secondary`}>
                        {author.biography || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
