// Halaman dashboard admin — panel utama untuk pemilik Saintifiks
// Server Component: data di-fetch di server, fresh setiap kali halaman dibuka
// Server Action: sign out ditangani lewat form action (tidak butuh client component terpisah)

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// force-dynamic: admin selalu butuh data terbaru, tidak boleh di-cache
export const dynamic = 'force-dynamic'

type Article = {
  id: string
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

// Format tanggal dari format database ke format Indonesia (19 Mei 2026)
function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Ambil data user — diperlukan untuk menampilkan email di header
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch SEMUA artikel termasuk draft — admin perlu lihat semuanya
  // Berbeda dengan halaman publik yang hanya fetch is_published = true
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, is_published, published_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Dashboard] Gagal mengambil daftar artikel:', error.message)
  }

  const daftarArtikel: Article[] = articles ?? []

  // Server Action: menangani proses logout
  // 'use server' menandai bahwa fungsi ini dijalankan di server, bukan di browser
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header panel admin */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Admin Panel
            </p>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-2">
              Saintifiks
            </h1>
            <p className="font-helvetica text-sm text-primary-dark/50 mt-1">
              {user?.email}
            </p>
          </div>

          {/* Tombol: Artikel Baru + Keluar */}
          <div className="flex items-center gap-6 mt-2">
            <Link
              href="/dashboard/artikel/baru"
              className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity duration-150"
            >
              + Artikel Baru
            </Link>

            <form action={handleSignOut}>
              <button
                type="submit"
                className="font-helvetica text-sm text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 underline underline-offset-2"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Seksi: daftar artikel */}
        <section>
          <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-5">
            Semua Artikel ({daftarArtikel.length})
          </h2>

          {daftarArtikel.length === 0 ? (

            // Empty state: belum ada artikel di database
            <div className="border border-primary-dark/10 py-20 text-center">
              <p className="font-helvetica text-sm text-primary-dark/40">
                Belum ada artikel. Klik &ldquo;+ Artikel Baru&rdquo; untuk mulai menulis.
              </p>
            </div>

          ) : (

            // Tabel daftar artikel
            <div className="border border-primary-dark/10">

              {/* Header tabel */}
              <div className="grid grid-cols-[1fr_120px_160px_48px] px-5 py-3 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Judul</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Status</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Tanggal</span>
                <span></span>
              </div>

              {/* Baris per artikel */}
              {daftarArtikel.map((artikel) => (
                <div
                  key={artikel.id}
                  className="grid grid-cols-[1fr_120px_160px_48px] px-5 py-4 border-b border-primary-dark/10 last:border-b-0 items-center hover:bg-primary-dark/[0.015] transition-colors duration-100"
                >
                  {/* Judul artikel */}
                  <span className="font-libre text-base font-bold text-primary-dark leading-snug pr-4">
                    {artikel.title}
                  </span>

                  {/* Badge status */}
                  <span className={`text-center font-helvetica text-xs px-3 py-1 ${
                    artikel.is_published
                      ? 'text-primary-dark bg-primary-dark/10'
                      : 'text-primary-dark/40 bg-primary-dark/5'
                  }`}>
                    {artikel.is_published ? 'Diterbitkan' : 'Draft'}
                  </span>

                  {/* Tanggal: published_at jika sudah diterbitkan, created_at jika masih draft */}
                  <span className="font-helvetica text-xs text-primary-dark/40">
                    {artikel.is_published && artikel.published_at
                      ? formatTanggal(artikel.published_at)
                      : formatTanggal(artikel.created_at)}
                  </span>

                  {/* Link edit — halaman editnya akan dibangun di sesi berikutnya */}
                  <Link
                    href={`/dashboard/artikel/${artikel.id}/edit`}
                    className="font-helvetica text-xs text-accent-blue hover:opacity-60 transition-opacity duration-150 text-right"
                  >
                    Edit
                  </Link>
                </div>
              ))}

            </div>

          )}
        </section>

      </div>
    </main>
  )
}
