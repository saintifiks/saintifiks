// Pratinjau editor Argumen tanpa login dan tanpa database. Hanya lokal dan preview Vercel (404 di produksi).
// ?status=draft|published|hidden · ?isi=1 mengisi judul dan teks contoh. Tombol simpan akan gagal (tidak ada API).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OpinionEditor from '@/components/opinions/editor/OpinionEditor'

export const metadata: Metadata = { title: 'Pratinjau Editor', robots: { index: false, follow: false } }

const BODY = `Debat soal makan siang gratis sering berhenti di angka anggaran. Yang jarang ditanyakan: siapa yang sebenarnya paling terbantu, dan kapan.

## Sasaran yang bergeser

Stunting terbentuk sebelum anak masuk sekolah. Program yang baru menyentuh anak usia tujuh tahun menyelamatkan kehadiran, bukan tinggi badan.`

export default async function EditorPreviewPage(props: { searchParams: Promise<{ status?: string; isi?: string }> }) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const sp = await props.searchParams
  const status = sp.status === 'published' || sp.status === 'hidden' ? sp.status : 'draft'
  const filled = !!sp.isi || status !== 'draft'

  return (
    <OpinionEditor
      mode="edit"
      articleId="00000000-0000-0000-0000-000000000000"
      authorUsername="rina"
      initialTitle={filled ? 'Makan Siang Gratis Menyelamatkan Kehadiran, Bukan Tinggi Badan' : ''}
      initialExcerpt={filled ? 'Program ini membantu anak bertahan di kelas. Tetapi sasaran usianya yang perlu dibicarakan.' : ''}
      initialContent={filled ? BODY : ''}
      initialStatus={status}
      slugLocked={status !== 'draft'}
    />
  )
}
