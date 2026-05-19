// Halaman beranda — menampilkan daftar artikel yang sudah dipublikasikan
// Server Component: data di-fetch di server, tidak membutuhkan JavaScript tambahan di browser

import { createClient } from '@/lib/supabase/server'

// ISR: Next.js meng-cache halaman ini dan memperbarui otomatis setiap 1 jam
export const revalidate = 3600

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BerandaPage() {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[Beranda] Gagal mengambil artikel:', error.message)
  }

  const daftarArtikel: Article[] = articles ?? []

  return (
    <main className="min-h-screen bg-primary-light">

      <header className="border-b border-primary-dark/10 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-libre text-4xl font-bold text-primary-dark tracking-tight">
            Saintifiks
          </h1>
          <p className="font-helvetica text-primary-dark/60 mt-3 text-base leading-relaxed">
            Media independen untuk pembaca yang peduli kualitas informasi publik.
          </p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-12">
        {daftarArtikel.length === 0 ? (
          <p className="font-helvetica text-sm text-primary-dark/40">
            Belum ada artikel yang dipublikasikan.
          </p>
        ) : (
          <ul className="divide-y divide-primary-dark/10">
            {daftarArtikel.map((artikel) => (
              <li key={artikel.id} className="py-10">
                <a href={`/artikel/${artikel.slug}`} className="group block">
                  {artikel.published_at && (
                    <time
                      dateTime={artikel.published_at}
                      className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest"
                    >
                      {formatTanggal(artikel.published_at)}
                    </time>
                  )}
                  <h2 className="font-libre text-2xl font-bold text-primary-dark mt-2 group-hover:opacity-60 transition-opacity duration-150">
                    {artikel.title}
                  </h2>
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