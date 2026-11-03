// Pratinjau kerangka admin dan antrean koreksi dengan data contoh — tanpa login dan tanpa database.
// Hanya lokal dan preview Vercel (404 di produksi). Tombol keputusan akan gagal (tidak ada admin).
// ?tampil=koreksi (bawaan) · moderasi · buku · tabel

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import PageHeader from '@/components/admin/PageHeader'
import KoreksiQueue from '@/components/admin/KoreksiQueue'
import OpinionsModeratorClient from '@/components/opinions/OpinionsModeratorClient'
import AddBookForm from '@/components/bookstore/admin/AddBookForm'
import { StatRow, table, adminLink } from '@/components/admin/ui'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Pratinjau Admin', robots: { index: false, follow: false } }

const ITEMS = [
  {
    key: 'a1',
    kind: 'article' as const,
    id: '1',
    title: 'MBG Tepat Sasaran. Tapi Sasarannya yang Salah',
    href: '/artikel/mbg',
    original: 'Stunting terbentuk dalam seribu hari pertama sampai usia tiga tahun.',
    corrected: 'Stunting terbentuk dalam seribu hari pertama, dari kehamilan sampai usia dua tahun.',
    explanation: 'Rujukan: definisi seribu hari pertama kehidupan (kehamilan hingga usia dua tahun).',
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    key: 'o1',
    kind: 'opinion' as const,
    id: '2',
    title: 'Rata-Rata Upah Menyembunyikan Lebih Banyak daripada yang Ditunjukkannya',
    href: null,
    original: 'Median upah naik 12 persen.',
    corrected: 'Median upah naik 1,2 persen.',
    explanation: null,
    createdAt: '2026-11-02T08:00:00Z',
  },
]

const PROFILE = { username: 'rina', display_name: 'Rina Anggraeni' }
const REPORTS = [
  {
    id: 'r1',
    reason: 'Tulisan ini menuduh individu tertentu tanpa dasar dan memuat data pribadi.',
    status: 'pending',
    created_at: '2026-11-02T08:00:00Z',
    reporter_user_id: null,
    opinion_article_id: 'x1',
    opinion_articles: { id: 'x1', title: 'Rata-Rata Upah Menyembunyikan Lebih Banyak', slug: 'rata-rata-upah', status: 'published', author_id: 'u1', user_profiles: PROFILE },
  },
]
const ARTICLES = [
  { id: 'x1', title: 'Rata-Rata Upah Menyembunyikan Lebih Banyak', slug: 'rata-rata-upah', status: 'published', published_at: '2026-10-21T08:00:00Z', created_at: '2026-10-21T08:00:00Z', author_id: 'u1', user_profiles: PROFILE },
  { id: 'x2', title: 'Koreksi Itu Bukan Aib', slug: 'koreksi', status: 'hidden', published_at: '2026-10-14T08:00:00Z', created_at: '2026-10-14T08:00:00Z', author_id: 'u1', user_profiles: PROFILE },
]

export default async function AdminPreviewPage(props: { searchParams: Promise<{ tampil?: string }> }) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const sp = await props.searchParams
  const tampil = sp.tampil ?? 'koreksi'

  return (
    <AdminShell
      email="redaksi@saintifiks.id"
      signOutAction={async () => {
        'use server'
      }}
      pending={{ '/dashboard/koreksi': 2, '/dashboard/opinions': 1 }}
    >
      {tampil === 'moderasi' && (
        <>
          <PageHeader eyebrow="Konten" title="Argumen" description="Tulisan pembaca terbit tanpa penyuntingan. Di sini Anda meninjau laporan dan menyembunyikan yang melanggar pedoman." breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Argumen' }]} />
          <OpinionsModeratorClient initialReports={REPORTS} initialArticles={ARTICLES} />
        </>
      )}
      {tampil === 'buku' && (
        <>
          <PageHeader eyebrow="Bookstore" title="Tambah buku" breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Bookstore' }]} />
          <div className="max-w-3xl">
            <AddBookForm authors={[{ id: '1', name: 'Pramoedya Ananta Toer' }]} publishers={[{ id: '1', name: 'Gramedia' }]} />
          </div>
        </>
      )}
      {tampil === 'tabel' && (
        <>
          <PageHeader eyebrow="Wawasan" title="Analitik" description="Interaksi pembaca per artikel." />
          <StatRow items={[{ label: 'Tampilan', value: '12.480' }, { label: 'Suka', value: '342' }, { label: 'Komentar', value: '57' }, { label: 'Bagikan', value: '91' }]} />
          <div className={`mt-12 ${table.wrap}`}>
            <table className={table.root}>
              <thead>
                <tr className={table.headRow}>
                  <th className={table.th}>Judul</th>
                  <th className={`${table.th} text-right`}>Tampil</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}><span className="sr-only">Tindakan</span></th>
                </tr>
              </thead>
              <tbody className={table.bodyRows}>
                {ITEMS.map((i) => (
                  <tr key={i.key}>
                    <td className={table.td}><p className="font-display text-base">{i.title}</p><p className="mt-1 font-mono text-caption text-text-tertiary">/{i.key}</p></td>
                    <td className={`${table.td} text-right font-mono text-caption`}>1.204</td>
                    <td className={table.td}><Badge variant="success">Terbit</Badge></td>
                    <td className={`${table.td} text-right`}><span className={`font-interface text-sm ${adminLink}`}>Ubah</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tampil === 'koreksi' && (
        <>
          <PageHeader
            eyebrow="Konten"
            title="Koreksi"
            description="Usulan koreksi dari pembaca. Yang disetujui tampil terbuka di artikel, bersama teks asli yang dikoreksi."
            breadcrumbs={[{ label: 'Admin', href: '/dashboard' }, { label: 'Koreksi' }]}
          />
          <h2 className="mb-4 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
            Menunggu · {ITEMS.length}
          </h2>
          <KoreksiQueue items={ITEMS} />
        </>
      )}
    </AdminShell>
  )
}
