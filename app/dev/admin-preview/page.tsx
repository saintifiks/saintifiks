// Pratinjau kerangka admin dan antrean koreksi dengan data contoh — tanpa login dan tanpa database.
// Hanya lokal dan preview Vercel (404 di produksi). Tombol keputusan akan gagal (tidak ada admin).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import PageHeader from '@/components/admin/PageHeader'
import KoreksiQueue from '@/components/admin/KoreksiQueue'

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

export default async function AdminPreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <AdminShell
      email="redaksi@saintifiks.id"
      signOutAction={async () => {
        'use server'
      }}
      pending={{ '/dashboard/koreksi': 2, '/dashboard/opinions': 1 }}
    >
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
    </AdminShell>
  )
}
