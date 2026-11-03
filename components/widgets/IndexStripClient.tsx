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
    <div className="flex shrink-0 items-center gap-2 px-4" title={tooltip}>
      <dt className="whitespace-nowrap font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
        {item.label}
      </dt>
      <TrendIcon trend={item.trend} trendWindow={item.trendWindow} />
      <dd className="m-0 whitespace-nowrap font-mono text-sm tabular-nums text-text-primary">{value}</dd>
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
    <aside className="surface-night bg-paper text-ink" aria-label="Angka: indikator ekonomi dan tata kelola">
      <div className="mx-auto flex max-w-6xl items-stretch">
        <div className="index-ticker-scroll min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          <dl className="m-0 flex h-10 min-w-max items-center">
            {items.map((item, i) => (
              <span key={item.id} className="flex items-center">
                {i > 0 && (
                  <span className="select-none text-text-tertiary" aria-hidden>
                    &middot;
                  </span>
                )}
                <TickerItem item={item} />
              </span>
            ))}
          </dl>
        </div>
      </div>
    </aside>
  )
}
