import type { Metadata } from 'next'
import { Badge } from '@/components/ui'
import KoreksiForm from '@/components/koreksi/KoreksiForm'

export const metadata: Metadata = {
  title: 'Sampaikan Koreksi — Saintifiks',
  description:
    'Sampaikan usulan koreksi dan klarifikasi untuk artikel editorial maupun argumen di Saintifiks. Setiap usulan akan ditinjau secara saksama demi integritas informasi.',
}

export default function KoreksiPage() {
  return (
    <main className="min-h-screen bg-surface-page">
      <div className="max-w-2xl mx-auto px-5 py-12 md:py-16">
        <header className="mb-10">
          <Badge variant="kicker" className="mb-2">
            Integritas
          </Badge>
          <h1 className="font-display text-3xl font-bold text-text-primary leading-tight">
            Sampaikan Koreksi & Klarifikasi
          </h1>
          <p className="font-interface text-sm text-text-secondary mt-3 leading-relaxed">
            Kami percaya bahwa kebenaran adalah proses pencarian yang terus berjalan, dan koreksi
            publik merupakan standar integritas kami. Setiap usulan koreksi yang Anda kirimkan
            akan ditinjau secara saksama oleh tim redaksi. Jika disetujui, koreksi tersebut akan
            ditampilkan secara publik pada artikel terkait.
          </p>
        </header>

        <section className="bg-surface-elevated border border-border-default/10 rounded-md p-6 sm:p-8 shadow-sm">
          <KoreksiForm />
        </section>
      </div>
    </main>
  )
}
