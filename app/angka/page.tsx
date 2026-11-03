// Angka — semua indikator yang dipantau Saintifiks dalam satu halaman: nilai, arah perubahan, dan sumbernya.
// Ticker di Beranda hanya ringkasannya. Diperbarui tiap 5 menit (ISR); nilai pasar bisa tertunda.

import type { Metadata } from 'next'
import { getIndicesSnapshot } from '@/lib/indices/get-indices'
import { trendWindowLabel } from '@/lib/indices/trend'
import type { IndexItem } from '@/lib/indices/types'
import TrendIcon from '@/components/widgets/TrendIcon'
import { Badge } from '@/components/ui'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Angka — Saintifiks',
  description: 'Indikator ekonomi, pasar, dan tata kelola yang dipantau Saintifiks, lengkap dengan sumbernya.',
  openGraph: {
    title: 'Angka — Saintifiks',
    description: 'Mereka punya narasi, kami punya angka.',
    siteName: 'Saintifiks',
  },
}

function Group({ title, note, items }: { title: string; note: string; items: IndexItem[] }) {
  return (
    <section aria-labelledby={`${title}-heading`} className="mt-14">
      <h2 id={`${title}-heading`} className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
        {title}
      </h2>
      <p className="mt-2 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary">{note}</p>

      <ul className="mt-6 divide-y divide-border-default/15 border-y border-border-default/20">
        {items.map((item) => {
          const ok = item.status === 'ok' && item.value
          const period = item.trendWindow ? trendWindowLabel(item.trendWindow) : ''
          return (
            <li key={item.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 sm:grid-cols-[1fr_auto_17rem]">
              <div className="min-w-0">
                <p className="font-display text-lg text-text-primary">{item.label}</p>
                {item.detail && <p className="mt-1 font-display text-body-sm italic text-text-secondary">{item.detail}</p>}
              </div>
              <p className="flex items-center justify-end gap-2 font-mono text-lg tabular-nums text-text-primary">
                <TrendIcon trend={item.trend} trendWindow={item.trendWindow} />
                {ok ? item.value : '—'}
              </p>
              <p className="col-span-2 font-mono text-caption text-text-tertiary sm:col-span-1 sm:text-right">
                {!ok ? 'Belum tersedia · ' : period ? `banding ${period} lalu · ` : ''}
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border-default/40 decoration-1 underline-offset-4 hover:decoration-text-primary"
                  >
                    {item.source}
                  </a>
                ) : (
                  item.source
                )}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default async function AngkaPage() {
  const snapshot = await getIndicesSnapshot()
  const waktu = new Date(snapshot.fetchedAt).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
        <header className="border-b border-border-default/20 pb-10">
          <Badge variant="kicker">Angka</Badge>
          <h1 className="mt-4 font-display text-display-sm leading-[1.12] tracking-[-0.01em] text-text-primary md:text-display-base">
            Angka yang kami pantau
          </h1>
          <p className="mt-5 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary sm:text-body-base">
            Mereka punya narasi, kami punya angka. Setiap nilai di sini disertai sumbernya, supaya Anda bisa memeriksanya
            sendiri.
          </p>
          <p className="mt-5 font-mono text-caption text-text-tertiary">Diperbarui {waktu} WIB</p>
        </header>

        <Group title="Pasar" note="Berubah sepanjang hari. Dapat tertunda beberapa menit dari sumbernya." items={snapshot.daily} />
        <Group title="Berkala" note="Diumumkan tiap bulan." items={snapshot.periodic} />
        <Group title="Tahunan" note="Indeks tata kelola dan pembangunan; nilai terbaru dari rilis tahunan." items={snapshot.annual} />

        <p className="mt-14 max-w-xl font-display text-body-sm italic leading-relaxed text-text-tertiary">
          Segitiga menunjukkan arah perubahan dibanding periode yang tertera. Arah naik tidak selalu berarti baik, dan
          turun tidak selalu buruk. Nilai yang belum bisa diambil dari sumbernya ditampilkan sebagai tanda hubung.
        </p>
      </div>
    </main>
  )
}
