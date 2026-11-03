// Pratinjau Argumen dengan teks contoh — tanpa database. Hanya lokal dan preview Vercel (404 di produksi).
// ?tampil=tulisan menampilkan halaman tulisan; bawaannya daftar. ?gambar=1 menambah gambar sampul.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArgumenRow from '@/components/opinions/ArgumenRow'
import ArgumenView from '@/components/opinions/ArgumenView'
import OpinionContentRenderer from '@/components/opinions/OpinionContentRenderer'

export const metadata: Metadata = { title: 'Pratinjau Argumen', robots: { index: false, follow: false } }

const COVER =
  'https://efkolgdeddpnpzgcnclo.supabase.co/storage/v1/object/public/artikel-gambar/1779342347021-mbg.webp'

const BODY = `Debat soal makan siang gratis sering berhenti di angka anggaran. Yang jarang ditanyakan: siapa yang sebenarnya paling terbantu, dan kapan.

## Sasaran yang bergeser

Stunting terbentuk sebelum anak masuk sekolah. Program yang baru menyentuh anak usia tujuh tahun menyelamatkan kehadiran, bukan tinggi badan.

> Intervensi yang tepat pada usia yang salah tetap intervensi yang salah.

Argumen ini tidak menolak programnya. Ia menolak klaimnya.`

const ROWS = [
  {
    title: 'Makan Siang Gratis Menyelamatkan Kehadiran, Bukan Tinggi Badan',
    slug: 'makan-siang-gratis',
    excerpt:
      'Program ini membantu anak bertahan di kelas. Tetapi stunting terbentuk jauh sebelum seragam dikenakan, dan sasaran usianya yang perlu dibicarakan.',
    cover: true,
    publishedAt: '2026-10-28T08:00:00Z',
  },
  {
    title: 'Mengapa Rata-Rata Upah Menyembunyikan Lebih Banyak daripada yang Ditunjukkannya',
    slug: 'rata-rata-upah',
    excerpt: null,
    cover: false,
    publishedAt: '2026-10-21T08:00:00Z',
  },
  {
    title: 'Koreksi Itu Bukan Aib',
    slug: 'koreksi-bukan-aib',
    excerpt: 'Redaksi yang menerbitkan koreksi lebih dapat dipercaya daripada yang tidak pernah salah.',
    cover: false,
    publishedAt: '2026-10-14T08:00:00Z',
  },
]

export default async function ArgumenPreviewPage(props: {
  searchParams: Promise<{ tampil?: string; gambar?: string }>
}) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const sp = await props.searchParams

  if (sp.tampil === 'tulisan') {
    return (
      <ArgumenView
        article={{
          id: '00000000-0000-0000-0000-000000000000',
          slug: 'pratinjau',
          title: 'Makan Siang Gratis Menyelamatkan Kehadiran, Bukan Tinggi Badan',
          excerpt: 'Program ini membantu anak bertahan di kelas. Tetapi sasaran usianya yang perlu dibicarakan.',
          cover_image_url: sp.gambar ? COVER : null,
          published_at: '2026-10-28T08:00:00Z',
        }}
        author={{ username: 'rina', display_name: 'Rina Anggraeni', avatar_url: null }}
        corrections={[]}
      >
        <OpinionContentRenderer content={BODY} charts={[]} />
      </ArgumenView>
    )
  }

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        {ROWS.map((r) => (
          <ArgumenRow
            key={r.slug}
            title={r.title}
            slug={r.slug}
            username="rina"
            displayName="Rina Anggraeni"
            excerpt={r.excerpt}
            coverImageUrl={r.cover || sp.gambar ? COVER : null}
            publishedAt={r.publishedAt}
          />
        ))}
      </div>
    </main>
  )
}
