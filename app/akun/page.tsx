// Halaman dashboard penulis (/akun) — Server Component
// Menampilkan daftar artikel, analitik, dan link ke profil publik

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import OpinionAnalyticsDashboard from '@/components/opinions/OpinionAnalyticsDashboard'
import AkunClient from '@/components/opinions/AkunClient'
import PreLogin from '@/components/layout/PreLogin'

export const dynamic = 'force-dynamic'

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function AkunPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Belum login → tampilkan halaman pra-login (gerbang masuk akun)
  if (!user) {
    return (
      <PreLogin
        next="/akun"
        title="Masuk ke Akun"
        description="Masuk untuk melihat dan mengelola artikel Anda di Saintifiks."
      />
    )
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  // Belum punya profil → tampilkan UsernameSetup (wrapped di Client Component)
  if (!profile) {
    return <AkunClient hasProfile={false} />
  }

  // Ambil semua artikel penulis
  const { data: articles } = await supabase
    .from('opinion_articles')
    .select('id, title, slug, status, slug_locked, published_at, created_at, updated_at')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  const daftarArtikel = articles ?? []

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header profil */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={56}
                height={56}
                className="rounded-full border border-primary-dark/10 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0">
                <span className="font-libre text-xl font-bold text-primary-light">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-libre text-2xl font-bold text-primary-dark">
                {profile.display_name}
              </h1>
              <Link
                href={`/penulis/${profile.username}`}
                className="font-helvetica text-xs text-primary-dark/40 hover:text-accent-blue transition-colors duration-150"
              >
                @{profile.username} · Lihat profil publik →
              </Link>
            </div>
          </div>

          <Link
            href="/akun/tulis"
            className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity duration-150 flex-shrink-0"
          >
            + Tulis Artikel
          </Link>
        </div>

        {/* Daftar artikel */}
        <section className="mb-16">
          <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-5">
            Artikel Saya ({daftarArtikel.length})
          </h2>

          {daftarArtikel.length === 0 ? (
            <div className="border border-primary-dark/10 py-20 text-center">
              <p className="font-helvetica text-sm text-primary-dark/40 mb-4">
                Kamu belum punya artikel. Mulai menulis sekarang.
              </p>
              <Link
                href="/akun/tulis"
                className="font-helvetica text-sm bg-primary-dark text-primary-light px-6 py-2.5 hover:opacity-80 transition-opacity duration-150"
              >
                Tulis Artikel Pertama
              </Link>
            </div>
          ) : (
            <div className="border border-primary-dark/10">
              {/* Header tabel */}
              <div className="grid grid-cols-[1fr_110px_160px_80px] px-5 py-3 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Judul</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Status</span>
                <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Terakhir diubah</span>
                <span />
              </div>

              {daftarArtikel.map((artikel) => (
                <div
                  key={artikel.id}
                  className="grid grid-cols-[1fr_110px_160px_80px] px-5 py-4 border-b border-primary-dark/10 last:border-b-0 items-center hover:bg-primary-dark/[0.015] transition-colors duration-100"
                >
                  <span className="font-libre text-base font-bold text-primary-dark leading-snug pr-4 truncate">
                    {artikel.title}
                  </span>

                  <span className={`text-center font-helvetica text-xs px-2.5 py-1 ${
                    artikel.status === 'published'
                      ? 'text-accent-green bg-accent-green/10'
                      : artikel.status === 'hidden'
                      ? 'text-accent-red bg-accent-red/10'
                      : 'text-primary-dark/40 bg-primary-dark/5'
                  }`}>
                    {artikel.status === 'published'
                      ? 'Diterbitkan'
                      : artikel.status === 'hidden'
                      ? 'Disembunyikan'
                      : 'Draft'}
                  </span>

                  <span className="font-helvetica text-xs text-primary-dark/40">
                    {formatTanggal(artikel.updated_at)}
                  </span>

                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/akun/artikel/${artikel.id}/edit`}
                      className="font-helvetica text-xs text-accent-blue hover:opacity-60 transition-opacity duration-150"
                    >
                      Edit
                    </Link>
                    {artikel.status === 'published' && (
                      <Link
                        href={`/opinions/${profile.username}/${artikel.slug}`}
                        className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150"
                        target="_blank"
                      >
                        ↗
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Analitik */}
        {daftarArtikel.some((a) => a.status === 'published') && (
          <section>
            <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-5">
              Analitik
            </h2>
            <OpinionAnalyticsDashboard />
          </section>
        )}

      </div>
    </main>
  )
}
