'use client'

// Tracker analytics untuk artikel opinions — terpisah dari AnalyticsTracker editorial
// Mengirim page_view dan scroll depth events ke opinion_analytics_events

import { useEffect, useRef } from 'react'

type OpinionAnalyticsTrackerProps = {
  articleId: string
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export default function OpinionAnalyticsTracker({ articleId }: OpinionAnalyticsTrackerProps) {
  const sessionId = useRef<string>(generateSessionId())
  const sentEvents = useRef<Set<string>>(new Set())

  async function sendEvent(eventType: string) {
    if (sentEvents.current.has(eventType)) return
    sentEvents.current.add(eventType)

    try {
      await fetch('/api/opinions/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opinion_article_id: articleId,
          event_type: eventType,
          session_id: sessionId.current,
        }),
        keepalive: true,
      })
    } catch {
      // Gagal kirim analytics — tidak perlu error fatal
    }
  }

  useEffect(() => {
    // Kirim page_view
    sendEvent('page_view')

    // Track scroll depth
    const scrollMilestones: { pct: number; event: string }[] = [
      { pct: 25, event: 'scroll_25' },
      { pct: 50, event: 'scroll_50' },
      { pct: 75, event: 'scroll_75' },
      { pct: 100, event: 'scroll_100' },
    ]

    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const pct = Math.round((scrollTop / docHeight) * 100)

      for (const milestone of scrollMilestones) {
        if (pct >= milestone.pct) {
          sendEvent(milestone.event)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId])

  return null
}
