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
      className="flex shrink-0 items-center gap-1.5 px-4 hover:bg-primary-light/[0.08] transition-colors duration-[120ms] cursor-default"
      title={tooltip}
    >
      <dt className="font-helvetica text-[11px] uppercase tracking-[0.1em] text-primary-light/50 whitespace-nowrap">
        {item.label}
      </dt>
      <TrendIcon trend={item.trend} trendWindow={item.trendWindow} />
      <dd className="font-helvetica text-sm font-semibold tabular-nums text-primary-light whitespace-nowrap m-0">
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
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false)

  const refresh = useCallback(async () => {
    // Jangan update data saat theme sedang transisi (mencegah flickering)
    if (isThemeTransitioning) return

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
  }, [isThemeTransitioning])

  // Deteksi saat theme transition sedang aktif
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasTransition = document.documentElement.classList.contains('theme-transition')
          setIsThemeTransitioning(hasTransition)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
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
      className="no-theme-transition w-full bg-primary-dark border-b border-primary-light/10"
      aria-label="Indikator ekonomi dan tata kelola"
    >
      <div className="index-ticker-scroll overflow-x-auto overscroll-x-contain">
        <dl className="flex h-9 min-w-max items-center px-2 sm:px-4">
          {items.map((item, i) => (
            <span key={item.id} className="flex items-center">
              {i > 0 && (
                <span className="text-primary-light/30 text-xs select-none" aria-hidden>&middot;</span>
              )}
              <TickerItem item={item} />
            </span>
          ))}
        </dl>
      </div>
    </aside>
  )
}