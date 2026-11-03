import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import { EmptyState, StatRow, adminLink, focusRing, table } from '@/components/admin/ui'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

type VariantData = {
  id: string
  format: string
  stock_qty: number
}

// Tipe buku ditulis eksplisit agar TypeScript tidak menebak (no implicit any).
type BookData = {
  id: string
  title: string
  status: string
  authors: { name: string } | { name: string }[] | null
  book_variants: VariantData[] | null
}

export default async function BookstoreAdminPage() {
  const supabase = await createClient()

  const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true })
  const { count: authorsCount } = await supabase.from('authors').select('*', { count: 'exact', head: true })
  const { count: publishersCount } = await supabase.from('publishers').select('*', { count: 'exact', head: true })

  const { data: books } = await supabase
    .from('books')
    .select(`
      id,
      title,
      status,
      authors ( name ),
      publishers ( name ),
      book_variants ( id, format, stock_qty )
    `)
    .order('created_at', { ascending: false })

  const daftarBuku = (books as unknown as BookData[]) ?? []

  return (
    <main aria-labelledby="bookstore-title">
      <PageHeader
        titleId="bookstore-title"
        eyebrow="Bookstore"
        title="Katalog buku"
        description="Informasi produk dan stok. Tambahkan penulis dan penerbit sebelum membuat buku."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Bookstore' }]}
        actions={
          <>
            <Link
              href="/dashboard/bookstore/buku/baru"
              className={`flex min-h-[44px] items-center bg-interactive-primary px-5 font-interface text-caption-lg font-semibold uppercase tracking-widest text-text-on-inverse transition-colors duration-fast hover:bg-interactive-primary-hover ${focusRing}`}
            >
              Tambah buku
            </Link>
            <Link href="/dashboard/bookstore/penulis" className={`font-interface text-sm text-text-primary ${adminLink} ${focusRing}`}>
              Penulis
            </Link>
            <Link href="/dashboard/bookstore/penerbit" className={`font-interface text-sm text-text-primary ${adminLink} ${focusRing}`}>
              Penerbit
            </Link>
          </>
        }
      />

      <div className="mb-12">
        <StatRow
          items={[
            { label: 'Buku', value: booksCount ?? 0 },
            { label: 'Penulis', value: authorsCount ?? 0 },
            { label: 'Penerbit', value: publishersCount ?? 0 },
          ]}
        />
      </div>

      {daftarBuku.length === 0 ? (
        <EmptyState title="Katalog masih kosong">
          Tambahkan penulis dan penerbit lebih dulu, lalu buat buku pertama.
        </EmptyState>
      ) : (
        <div className={table.wrap}>
          <table className={table.root}>
            <caption className="sr-only">Daftar buku di katalog</caption>
            <thead>
              <tr className={table.headRow}>
                <th scope="col" className={table.th}>Buku</th>
                <th scope="col" className={table.th}>Status</th>
                <th scope="col" className={`${table.th} text-right`}>Varian</th>
                <th scope="col" className={`${table.th} text-right`}>Stok</th>
              </tr>
            </thead>
            <tbody className={table.bodyRows}>
              {daftarBuku.map((book) => {
                const rawAuthor = Array.isArray(book.authors) ? book.authors[0] : book.authors
                const variants = book.book_variants || []
                const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0)

                return (
                  <tr key={book.id}>
                    <th scope="row" className={`${table.td} font-normal`}>
                      <p className="font-display text-base text-text-primary">{book.title}</p>
                      <p className="mt-1 font-interface text-sm text-text-secondary">{rawAuthor?.name ?? '—'}</p>
                    </th>
                    <td className={table.td}>
                      <Badge variant={book.status === 'active' ? 'success' : 'default'}>
                        {book.status === 'active' ? 'Aktif' : book.status}
                      </Badge>
                    </td>
                    <td className={`${table.td} text-right font-mono text-caption tabular-nums text-text-secondary`}>
                      {variants.length}
                    </td>
                    <td className={`${table.td} text-right font-mono text-caption tabular-nums text-text-secondary`}>
                      {totalStock}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
