import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { tambahPenulis } from '../actions'

export const dynamic = 'force-dynamic'

export default async function PenulisAdminPage() {
  const supabase = await createClient()

  // Ambil daftar penulis
  const { data: authors } = await supabase
    .from('authors')
    .select('*')
    .order('created_at', { ascending: false })

  const daftarPenulis = authors ?? []

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Bookstore PIM
            </p>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-2">
              Kelola Penulis
            </h1>
          </div>
          <Link
            href="/dashboard/bookstore"
            className="font-helvetica text-sm text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 mt-2"
          >
            ← Kembali ke PIM
          </Link>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
          
          {/* Kolom Kiri: Form Tambah Penulis */}
          <div className="bg-white border border-primary-dark/10 p-5">
            <h2 className="font-interface font-bold text-primary-dark mb-4">Tambah Penulis Baru</h2>
            <form action={async (formData) => {
              'use server'
              await tambahPenulis({
                name: formData.get('name') as string,
                biography: formData.get('biography') as string,
              })
            }} className="space-y-4">
              <div>
                <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1.5">
                  Nama Penulis *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-primary-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-primary-dark/50"
                  placeholder="Misal: Pramoedya Ananta Toer"
                />
              </div>
              <div>
                <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1.5">
                  Biografi Singkat
                </label>
                <textarea
                  name="biography"
                  rows={4}
                  className="w-full border border-primary-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-primary-dark/50 resize-none"
                  placeholder="Opsional..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-dark text-primary-light font-helvetica text-sm py-2.5 hover:opacity-80 transition-opacity"
              >
                Simpan Penulis
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Tabel Daftar Penulis */}
          <div>
            <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-4">
              Daftar Penulis ({daftarPenulis.length})
            </h2>
            {daftarPenulis.length === 0 ? (
              <div className="border border-primary-dark/10 py-12 text-center bg-white">
                <p className="font-interface text-sm text-primary-dark/50">Belum ada data penulis.</p>
              </div>
            ) : (
              <div className="border border-primary-dark/10 bg-white">
                <div className="grid grid-cols-[1fr_2fr] px-4 py-2.5 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
                  <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Nama</span>
                  <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Biografi</span>
                </div>
                {daftarPenulis.map((author) => (
                  <div key={author.id} className="grid grid-cols-[1fr_2fr] px-4 py-3 border-b border-primary-dark/10 last:border-b-0 items-start">
                    <span className="font-interface font-semibold text-sm text-primary-dark">{author.name}</span>
                    <span className="font-interface text-sm text-primary-dark/60 line-clamp-2">
                      {author.biography || '-'}
                    </span>
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