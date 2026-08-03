import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Definisikan tipe agar TypeScript bahagia
type VariantData = {
  id: string
  format: string
  stock_qty: number
}

export default async function BookstoreAdminPage() {
  const supabase = await createClient()

  // Ambil statistik dasar
  const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true })
  const { count: authorsCount } = await supabase.from('authors').select('*', { count: 'exact', head: true })
  const { count: publishersCount } = await supabase.from('publishers').select('*', { count: 'exact', head: true })

  // Ambil daftar buku beserta relasinya
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

  const daftarBuku = books ?? []

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Panel */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Admin Panel
            </p>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-2">
              Manajemen Bookstore
            </h1>
            <p className="font-helvetica text-sm text-primary-dark/50 mt-1">
              PIM (Product Information Management) & Inventaris
            </p>
          </div>

          <Link href="/dashboard" className="font-helvetica text-sm text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 mt-2">
            ← Kembali ke Dashboard Utama
          </Link>
        </div>

        {/* Statistik Cepat */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-primary-dark/10 bg-white px-5 py-4">
            <p className="font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Total Buku</p>
            <p className="font-libre text-3xl font-bold text-primary-dark">{booksCount ?? 0}</p>
          </div>
          <div className="border border-primary-dark/10 bg-white px-5 py-4">
            <p className="font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Total Penulis</p>
            <p className="font-libre text-3xl font-bold text-primary-dark">{authorsCount ?? 0}</p>
          </div>
          <div className="border border-primary-dark/10 bg-white px-5 py-4">
            <p className="font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Total Penerbit</p>
            <p className="font-libre text-3xl font-bold text-primary-dark">{publishersCount ?? 0}</p>
          </div>
        </div>

        {/* Navigasi Aksi */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/bookstore/buku/baru" className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity">
            + Tambah Buku
          </Link>
          <Link href="/dashboard/bookstore/penulis" className="font-helvetica text-sm border border-primary-dark/40 px-5 py-2.5 hover:bg-primary-dark hover:text-primary-light transition-all">
            Kelola Penulis
          </Link>
          <Link href="/dashboard/bookstore/penerbit" className="font-helvetica text-sm border border-primary-dark/40 px-5 py-2.5 hover:bg-primary-dark hover:text-primary-light transition-all">
            Kelola Penerbit
          </Link>
        </div>

        {/* Tabel Daftar Buku */}
        <section>
          {daftarBuku.length === 0 ? (
            <div className="border border-primary-dark/10 py-20 text-center bg-white">
              <p className="font-helvetica text-sm text-primary-dark/40 mb-4">
                Katalog kosong. Anda harus menambahkan Penulis dan Penerbit sebelum membuat Buku.
              </p>
            </div>
          ) : (
            <div className="border border-primary-dark/10 bg-white">
              <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_100px] px-5 py-3 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Buku & Penulis</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Status</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Varian (SKU)</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Stok Total</span>
                <span></span>
              </div>

              {daftarBuku.map((book) => {
                // Ekstraksi data secara aman menggunakan TypeScript
                const rawAuthor = Array.isArray(book.authors) ? book.authors[0] : book.authors
                const authorName = (rawAuthor as unknown as { name: string } | null)?.name ?? '-'
                const variants = (book.book_variants as unknown as VariantData[]) || []
                const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0)

                return (
                  <div key={book.id} className="grid grid-cols-[2fr_1fr_1fr_1.5fr_100px] px-5 py-4 border-b border-primary-dark/10 last:border-b-0 items-center hover:bg-primary-dark/[0.015] transition-colors">
                    <div>
                      <p className="font-libre text-base font-bold text-primary-dark leading-snug line-clamp-1">{book.title}</p>
                      <p className="font-helvetica text-xs text-primary-dark/50 mt-1">{authorName}</p>
                    </div>
                    <div>
                      <span className={`inline-flex font-helvetica text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm ${
                        book.status === 'active' ? 'bg-signal-success/10 text-signal-success' : 'bg-primary-dark/10 text-primary-dark'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                    <div className="text-center font-helvetica text-sm text-primary-dark/70">{variants.length}</div>
                    <div className="font-helvetica text-sm text-primary-dark/70">{totalStock} unit</div>
                    <div className="text-right">
                      <Link href={`/dashboard/bookstore/buku/${book.id}`} className="font-helvetica text-xs text-accent-blue hover:opacity-60 transition-opacity">Kelola</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}