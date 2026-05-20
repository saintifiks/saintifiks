import { getIndicesSnapshot } from '@/lib/indices/get-indices'
import type { IndexItem } from '@/lib/indices/types'

function TickerItem({ item }: { item: IndexItem }) {
  const value = item.status === 'ok' && item.value ? item.value : '—'
  const tooltip = [item.label, value, item.detail, item.source]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className="flex shrink-0 items-center gap-2 border-r border-primary-light/15 px-4 last:border-r-0"
      title={tooltip}
    >
      <dt className="font-helvetica text-[10px] uppercase tracking-widest text-primary-light/50 whitespace-nowrap">
        {item.label}
      </dt>
      <dd className="font-libre text-xs font-bold tabular-nums text-primary-light whitespace-nowrap m-0">
        {value}
      </dd>
    </div>
  )
}

export default async function IndexStrip() {
  const snapshot = await getIndicesSnapshot()
  const items = [
    ...snapshot.daily,
    ...snapshot.periodic,
    ...snapshot.annual,
  ]

  return (
    <aside
      className="w-full bg-primary-dark border-b border-primary-light/10"
      aria-label="Indikator ekonomi dan tata kelola"
    >
      <div className="overflow-x-auto overscroll-x-contain">
        <dl className="flex h-9 min-w-max items-center px-2 sm:px-4">
          {items.map((item) => (
            <TickerItem key={item.id} item={item} />
          ))}
        </dl>
      </div>
    </aside>
  )
}
