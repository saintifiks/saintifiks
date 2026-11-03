import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AddBookForm from '@/components/bookstore/admin/AddBookForm'

export const dynamic = 'force-dynamic'

export default async function HalamanTambahBuku() {
  const supabase = await createClient()

  // Tarik data referensi untuk dropdown
  const { data: authors } = await supabase.from('authors').select('id, name').order('name')
  const { data: publishers } = await supabase.from('publishers').select('id, name').order('name')

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-interface text-xs text-warm-gray uppercase tracking-widest">Bookstore PIM</p>
            <h1 className="font-display text-3xl font-bold text-ink mt-2">Tambah Buku Baru</h1>
          </div>
          <Link href="/dashboard/bookstore" className="font-interface text-sm text-warm-gray hover:text-ink transition-colors mt-2">
            ← Batal
          </Link>
        </div>

        <AddBookForm authors={authors ?? []} publishers={publishers ?? []} />
      </div>
    </main>
  )
}