'use client'

import { useCallback, useEffect, useState } from 'react'
import type { IndexItem } from '@/lib/indices/types'
import { INDICES_DEFAULT_POLL_MS, INDICES_MIN_POLL_MS } from '@/lib/indices/types'
import { trendWindowLabel } from '@/lib/indices/trend'
import TrendIcon from './TrendIcon'

type ApiResponse = {
  items: IndexItem[]
  fetchedAt: string
  pollIntervalMs: number
}

function TickerItem({ item }: { item: IndexItem }) {
  const value = item.status === 'ok' && item.value ? item.value : '—'
  const period = item.trendWindow ? trendWindowLabel(item.trendWindow) : ''
  const tooltip = [item.label, value, period && `banding ${period}`, item.detail, item.source]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 border-r border-primary-light/15 px-4 last:border-r-0"
      title={tooltip}
    >
      <dt className="font-helvetica text-[10px] uppercase tracking-widest text-primary-light/50 whitespace-nowrap">
        {item.label}
      </dt>
      <TrendIcon trend={item.trend} trendWindow={item.trendWindow} />
      <dd className="font-libre text-xs font-bold tabular-nums text-primary-light whitespace-nowrap m-0">
        {value}
      </dd>
    </div>
  )
}

type IndexStripClientProps = {
  initialItems: IndexItem[]
  initialPollMs?: number
}

export default function IndexStripClient({
  initialItems,
  initialPollMs = INDICES_DEFAULT_POLL_MS,
}: IndexStripClientProps) {
  const [items, setItems] = useState(initialItems)
  const [pollMs, setPollMs] = useState(
    Math.max(INDICES_MIN_POLL_MS, initialPollMs)
  )

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/indices', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as ApiResponse
      if (data.items?.length) setItems(data.items)
      if (data.pollIntervalMs) {
        setPollMs(Math.max(INDICES_MIN_POLL_MS, data.pollIntervalMs))
      }
    } catch {
      // Pertahankan data terakhir agar strip tetap tenang
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    tick()
    const id = window.setInterval(tick, pollMs)
    return () => window.clearInterval(id)
  }, [pollMs, refresh])

  return (
    <aside
      className="w-full bg-primary-dark border-b border-primary-light/10"
      aria-label="Indikator ekonomi dan tata kelola"
    >
      <div className="index-ticker-scroll overflow-x-auto overscroll-x-contain">
        <dl className="flex h-9 min-w-max items-center px-2 sm:px-4">
          {items.map((item) => (
            <TickerItem key={item.id} item={item} />
          ))}
        </dl>
      </div>
    </aside>
  )
}
