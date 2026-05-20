import { getIndicesSnapshot } from '@/lib/indices/get-indices'
import type { IndexItem } from '@/lib/indices/types'

function IndexCell({ item }: { item: IndexItem }) {
  return (
    <div className="min-w-0">
      <dt className="font-helvetica text-[10px] uppercase tracking-widest text-primary-dark/45">
        {item.label}
      </dt>
      <dd className="font-libre text-lg font-bold text-primary-dark mt-1 tabular-nums">
        {item.status === 'ok' && item.value ? item.value : '—'}
      </dd>
      {item.detail && (
        <p className="font-helvetica text-[11px] text-primary-dark/40 mt-0.5">
          {item.detail}
        </p>
      )}
    </div>
  )
}

function IndexGroup({
  title,
  items,
}: {
  title: string
  items: IndexItem[]
}) {
  return (
    <div>
      <h2 className="font-helvetica text-[10px] uppercase tracking-widest text-primary-dark/35 mb-4">
        {title}
      </h2>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
        {items.map((item) => (
          <IndexCell key={item.id} item={item} />
        ))}
      </dl>
    </div>
  )
}

export default async function IndexStrip() {
  const snapshot = await getIndicesSnapshot()

  const sources = [
    ...snapshot.daily,
    ...snapshot.periodic,
    ...snapshot.annual,
  ]
    .filter((i) => i.status === 'ok')
    .map((i) => i.source)
  const uniqueSources = Array.from(new Set(sources))

  return (
    <aside
      className="border-b border-primary-dark/10 bg-primary-light"
      aria-label="Indikator ekonomi dan tata kelola"
    >
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <IndexGroup title="Pasar & komoditas" items={snapshot.daily} />
        <IndexGroup title="Kebijakan moneter" items={snapshot.periodic} />
        <IndexGroup title="Tata kelola & pembangunan" items={snapshot.annual} />

        <p className="font-helvetica text-[11px] text-primary-dark/35 leading-relaxed border-t border-primary-dark/10 pt-6">
          Data diperbarui otomatis di server (tanpa polling di browser). Sumber:{' '}
          {uniqueSources.length > 0 ? uniqueSources.join(' · ') : 'tidak tersedia'}.
          {process.env.BPS_API_KEY
            ? ''
            : ' Inflasi bulanan BPS tersedia jika BPS_API_KEY diatur.'}
        </p>
      </div>
    </aside>
  )
}
