import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/admin/PageHeader'
import { EmptyState, sectionTitle } from '@/components/admin/ui'
import QuickAddForm from '@/components/bookstore/admin/QuickAddForm'

export const dynamic = 'force-dynamic'

export default async function PenerbitAdminPage() {
  const supabase = await createClient()
  const { data: publishers } = await supabase.from('publishers').select('*').order('created_at', { ascending: false })
  const daftarPenerbit = publishers ?? []

  return (
    <main aria-labelledby="penerbit-title">
      <PageHeader
        titleId="penerbit-title"
        eyebrow="Bookstore"
        title="Penerbit"
        description="Penerbit buku di katalog. Tambahkan penerbit sebelum membuat buku."
        breadcrumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Bookstore', href: '/dashboard/bookstore' },
          { label: 'Penerbit' },
        ]}
      />

      <div className="grid items-start gap-12 md:grid-cols-[300px_1fr]">
        <section aria-labelledby="tambah-heading">
          <h2 id="tambah-heading" className={`mb-5 ${sectionTitle}`}>
            Tambah penerbit
          </h2>
          <QuickAddForm kind="penerbit" />
        </section>

        <section aria-labelledby="daftar-heading">
          <h2 id="daftar-heading" className={`mb-4 ${sectionTitle}`}>
            Daftar · {daftarPenerbit.length}
          </h2>
          {daftarPenerbit.length === 0 ? (
            <EmptyState title="Belum ada penerbit" />
          ) : (
            <ul className="divide-y divide-border-default/15 border-y border-border-default/20">
              {daftarPenerbit.map((pub) => (
                <li key={pub.id} className="py-4 font-display text-base text-text-primary">
                  {pub.name}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
