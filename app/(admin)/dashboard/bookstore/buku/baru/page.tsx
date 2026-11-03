import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import AddBookForm from '@/components/bookstore/admin/AddBookForm'

export const dynamic = 'force-dynamic'

export default async function HalamanTambahBuku() {
  const supabase = await createClient()

  // Data referensi untuk pilihan penulis dan penerbit
  const { data: authors } = await supabase.from('authors').select('id, name').order('name')
  const { data: publishers } = await supabase.from('publishers').select('id, name').order('name')

  return (
    <main aria-labelledby="buku-baru-title">
      <PageHeader
        titleId="buku-baru-title"
        eyebrow="Bookstore"
        title="Tambah buku"
        breadcrumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Bookstore', href: '/dashboard/bookstore' },
          { label: 'Tambah buku' },
        ]}
      />

      <div className="max-w-3xl">
        <AddBookForm authors={authors ?? []} publishers={publishers ?? []} />
      </div>
    </main>
  )
}
