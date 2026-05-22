// Halaman beranda — menampilkan daftar artikel yang sudah dipublikasikan
// Server Component: data di-fetch di server, tidak membutuhkan JavaScript tambahan di browser

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

// ISR: Next.js meng-cache halaman ini dan memperbarui otomatis setiap 1 jam
// Artikel baru yang di-publish akan muncul dalam maksimal 60 menit
export const revalidate = 3600

// Metadata statis untuk halaman beranda
// Halaman artikel individual punya metadata dinamis sendiri di masing-masing page.tsx
export const metadata: Metadata = {
  title: 'Saintifiks',
  description: 'Mereka punya narasi, kami punya angka.',
  openGraph: {
    title: 'Saintifiks',
    description: 'Mereka punya narasi, kami punya angka.',
    // og:url — metadataBase di layout.tsx akan mengubah "/" menjadi URL absolut
    url: '/',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Saintifiks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saintifiks',
    description: 'Mereka punya narasi, kami punya angka.',
  },
}

// Tipe data untuk satu artikel yang diambil dari database
type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
}

// Format tanggal dari format database (2026-05-19T...) ke format Indonesia (19 Mei 2026)
function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BerandaPage() {
  const supabase = await createClient()

  // Ambil artikel yang sudah dipublikasikan, urutkan dari yang terbaru
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  // Jika ada error saat mengambil data, catat di log server (tidak ditampilkan ke pembaca)
  if (error) {
    console.error('[Beranda] Gagal mengambil artikel:', error.message)
  }

  // Jika data null (misalnya karena error), gunakan array kosong agar halaman tetap bisa render
  const daftarArtikel: Article[] = articles ?? []

  return (
    <main className="min-h-screen bg-primary-light">
      {/* Header beranda — logo, nama brand, dan tagline */}
      <header className="border-b border-primary-dark/10 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-8 h-24 w-24 sm:h-28 sm:w-28">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Logo Saintifiks"
              role="img"
              style={{ width: '100%', height: '100%' }}
            >
              <path d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z" style={{ fill: '#0D0D0D' }} />
              <path d="M38.2842 56.7739H39.8914C40.0941 58.0927 40.4706 59.2797 41.0208 60.3347C41.6 61.3898 42.3095 62.2837 43.1493 63.0164C44.0181 63.749 45.0027 64.3205 46.1032 64.7308C47.2326 65.1118 48.4488 65.3023 49.752 65.3023C51.895 65.3023 53.5891 64.7895 54.8343 63.7637C56.0796 62.7379 56.7022 61.3458 56.7022 59.5874C56.7022 58.8547 56.5719 58.1806 56.3113 57.5652C56.0796 56.9497 55.6742 56.3636 55.095 55.8067C54.5158 55.2206 53.7339 54.6491 52.7493 54.0922C51.7936 53.5354 50.5773 52.9346 49.1004 52.2898C47.305 51.4985 45.7991 50.7365 44.5828 50.0039C43.3665 49.2712 42.3964 48.5092 41.6724 47.7179C40.9484 46.9266 40.4272 46.0913 40.1086 45.2121C39.819 44.3036 39.6742 43.2778 39.6742 42.1348C39.6742 40.7867 39.9059 39.5411 40.3692 38.3981C40.8615 37.2551 41.5421 36.2733 42.4109 35.4527C43.2796 34.6028 44.3077 33.9581 45.495 33.5184C46.6823 33.0495 47.9855 32.8151 49.4045 32.8151C50.6787 32.8151 51.866 33.0202 52.9665 33.4305C54.0669 33.8408 55.1819 34.5002 56.3113 35.4088L57.4407 33.4305H58.4398L58.9176 42.1788H57.3104C56.6153 39.7756 55.6018 37.9878 54.2696 36.8155C52.9665 35.6432 51.3882 35.0571 49.5348 35.0571C47.7683 35.0571 46.3638 35.4967 45.3213 36.3759C44.2787 37.2551 43.7575 38.4421 43.7575 39.9368C43.7575 40.6401 43.8733 41.2849 44.105 41.8711C44.3366 42.4279 44.7131 42.9701 45.2344 43.4976C45.7556 43.9958 46.4362 44.5087 47.276 45.0363C48.1158 45.5345 49.1583 46.062 50.4036 46.6189C52.5466 47.586 54.3276 48.4945 55.7466 49.3444C57.1656 50.1651 58.295 51.0003 59.1348 51.8502C59.9746 52.6708 60.5683 53.5501 60.9158 54.4879C61.2633 55.3964 61.437 56.4222 61.437 57.5652C61.437 59.0305 61.1474 60.3787 60.5683 61.6096C59.9891 62.8405 59.1782 63.8956 58.1357 64.7748C57.0932 65.654 55.8479 66.3427 54.4 66.841C52.952 67.3099 51.3592 67.5443 49.6217 67.5443C47.971 67.5443 46.4796 67.3099 45.1475 66.841C43.8443 66.3721 42.5122 65.5807 41.1511 64.4671L39.9349 66.6212H38.9358L38.2842 56.7739Z" style={{ fill: '#F5F4F0' }} />
            </svg>
          </div>
          <h1 className="font-libre text-5xl font-bold text-primary-dark tracking-tight sm:text-6xl">
            Saintifiks
          </h1>
          <p className="font-helvetica mx-auto mt-4 max-w-xl text-primary-dark/70 text-lg leading-relaxed sm:text-xl">
            Mereka punya narasi, kami punya angka.
          </p>
        </div>
      </header>

      {/* Daftar artikel */}
      <section className="max-w-2xl mx-auto px-6 py-12">

        {daftarArtikel.length === 0 ? (

          // Kondisi kosong: belum ada artikel yang dipublikasikan
          // Ini yang akan muncul saat database masih kosong
          <p className="font-helvetica text-sm text-primary-dark/40">
            Belum ada artikel yang dipublikasikan.
          </p>

        ) : (

          // Kondisi ada artikel: tampilkan daftar
          <ul className="divide-y divide-primary-dark/10">
            {daftarArtikel.map((artikel) => (
              <li key={artikel.id} className="py-10">
                <a
                  href={`/artikel/${artikel.slug}`}
                  className="group block"
                >
                  {/* Tanggal terbit — hanya tampil jika ada */}
                  {artikel.published_at && (
                    <time
                      dateTime={artikel.published_at}
                      className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest"
                    >
                      {formatTanggal(artikel.published_at)}
                    </time>
                  )}

                  {/* Judul artikel */}
                  <h2 className="font-libre text-2xl font-bold text-primary-dark mt-2 group-hover:opacity-60 transition-opacity duration-150">
                    {artikel.title}
                  </h2>

                  {/* Excerpt / ringkasan — hanya tampil jika ada */}
                  {artikel.excerpt && (
                    <p className="font-helvetica text-base text-primary-dark/70 mt-2 leading-relaxed">
                      {artikel.excerpt}
                    </p>
                  )}
                </a>
              </li>
            ))}
          </ul>

        )}
      </section>

    </main>
  )
}
