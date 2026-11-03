import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { tambahPenerbit } from '../actions'

export const dynamic = 'force-dynamic'

export default async function PenerbitAdminPage() {
  const supabase = await createClient()

  const { data: publishers } = await supabase
    .from('publishers')
    .select('*')
    .order('created_at', { ascending: false })

  const daftarPenerbit = publishers ?? []

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-interface text-xs text-warm-gray uppercase tracking-widest">Bookstore PIM</p>
            <h1 className="font-display text-3xl font-bold text-ink mt-2">Kelola Penerbit</h1>
          </div>
          <Link href="/dashboard/bookstore" className="font-interface text-sm text-warm-gray hover:text-ink transition-colors mt-2">
            ← Kembali ke PIM
          </Link>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Form Tambah Penerbit */}
          <div className="bg-white border border-ink/10 p-5">
            <h2 className="font-interface font-bold text-ink mb-4">Tambah Penerbit</h2>
            <form action={async (formData) => {
              'use server'
              await tambahPenerbit({ name: formData.get('name') as string })
            }} className="space-y-4">
              <div>
                <label className="block font-interface text-xs text-warm-gray uppercase tracking-widest mb-1.5">Nama Penerbit *</label>
                <input type="text" name="name" required className="w-full border border-ink/20 px-3 py-2 text-sm focus:outline-none focus:border-ink/50" placeholder="Misal: Gramedia" />
              </div>
              <button type="submit" className="w-full bg-ink text-paper font-interface text-sm py-2.5 hover:opacity-80 transition-opacity">
                Simpan Penerbit
              </button>
            </form>
          </div>

          {/* Daftar Penerbit */}
          <div>
            <h2 className="font-interface text-xs text-warm-gray uppercase tracking-widest mb-4">Daftar Penerbit ({daftarPenerbit.length})</h2>
            {daftarPenerbit.length === 0 ? (
              <div className="border border-ink/10 py-12 text-center bg-white">
                <p className="font-interface text-sm text-warm-gray">Belum ada data penerbit.</p>
              </div>
            ) : (
              <div className="border border-ink/10 bg-white">
                {daftarPenerbit.map((pub) => (
                  <div key={pub.id} className="px-4 py-3 border-b border-ink/10 last:border-b-0">
                    <span className="font-interface font-semibold text-sm text-ink">{pub.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}