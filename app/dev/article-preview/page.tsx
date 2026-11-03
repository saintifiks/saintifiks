// Pratinjau halaman artikel dengan teks contoh — tanpa database. Hanya lokal dan preview Vercel (404 di produksi).
// ?gambar=1 sampul · ?label=1 kategori dan kicker · ?koreksi=1 dua koreksi contoh.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/artikel/ArticleView'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'

export const metadata: Metadata = { title: 'Pratinjau Artikel', robots: { index: false, follow: false } }

const BODY = `Program makan sekolah sering dibicarakan sebagai jawaban atas stunting. Angkanya menunjukkan cerita yang lebih rumit: program ini membantu anak hadir dan bertahan di kelas, tetapi tinggi badan seorang anak sudah banyak ditentukan jauh sebelum ia mengenakan seragam.

## Apa yang diukur, dan kapan

Stunting terbentuk dalam seribu hari pertama kehidupan, dari kehamilan sampai usia dua tahun. Seorang anak yang makan dengan baik di kelas satu tidak otomatis "mengejar" tinggi badan yang hilang. Itulah alasan sasaran program menentukan hasilnya.

> Intervensi yang tepat pada usia yang salah tetap intervensi yang salah.

Tiga hal membedakan program yang berhasil dari yang sekadar besar:

- **Sasaran usia.** Ibu hamil dan anak di bawah dua tahun, bukan hanya siswa.
- **Gizi, bukan hanya kalori.** Protein hewani dan mikronutrien lebih menentukan daripada porsi.
- **Pengukuran berkala.** Tinggi badan dicatat tiap semester, bukan satu kali di awal tahun.

## Yang dikatakan datanya

Evaluasi awal memperlihatkan kehadiran siswa naik beberapa poin persentase di sekolah penerima. Namun, penurunan prevalensi stunting nasional tidak bisa ditautkan ke program ini karena kelompok usia yang diukur berbeda.

Untuk pembaca yang ingin menelusuri sendiri, kami mencantumkan sumber dan metodologi di akhir tulisan. Jika Anda menemukan kekeliruan angka, gunakan tombol koreksi di sisi artikel.`

export default async function ArticlePreviewPage(props: {
  searchParams: Promise<{ gambar?: string; label?: string; koreksi?: string }>
}) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const sp = await props.searchParams

  const article = {
    id: '00000000-0000-0000-0000-000000000000',
    slug: 'pratinjau',
    title: 'MBG Tepat Sasaran. Tapi Sasarannya yang Salah',
    excerpt:
      'Program makan sekolah terbukti membantu anak hadir di sekolah, bukan membalikkan stunting yang sudah terkonsolidasi sejak sebelum anak itu duduk di kelas satu.',
    cover_image_url: sp.gambar
      ? 'https://efkolgdeddpnpzgcnclo.supabase.co/storage/v1/object/public/artikel-gambar/1779342347021-mbg.webp'
      : null,
    published_at: '2026-05-21T18:24:50Z',
    category: sp.label ? 'Kesehatan' : null,
    kicker: sp.label ? 'Gizi anak' : null,
    cover_illustrator: sp.gambar ? 'Redaksi Saintifiks' : null,
  }

  const corrections = sp.koreksi
    ? [
        {
          id: 'k1',
          original_text: 'Stunting terbentuk dalam seribu hari pertama sampai usia tiga tahun.',
          corrected_text: 'Stunting terbentuk dalam seribu hari pertama, dari kehamilan sampai usia dua tahun.',
          explanation: 'Rujukan: definisi seribu hari pertama kehidupan (kehamilan hingga usia dua tahun).',
          created_at: '2026-05-22T08:00:00Z',
        },
        {
          id: 'k2',
          original_text: 'Kehadiran naik sepuluh poin persentase.',
          corrected_text: 'Kehadiran naik beberapa poin persentase.',
          explanation: null,
          created_at: '2026-05-23T08:00:00Z',
        },
      ]
    : []

  return (
    <ArticleView article={article} readingMinutes={6} corrections={corrections}>
      <ArticleRenderer content={BODY} charts={[]} />
    </ArticleView>
  )
}
