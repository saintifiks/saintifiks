'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const sessionIdRef = useRef<string>('')

  useEffect(() => {
    // Detail artikel Opinions memiliki tracker khusus untuk statistik penulis.
    // Lewati tracker site-wide agar satu kunjungan tidak direkam dua kali.
    const segments = pathname.split('/').filter(Boolean)
    const isOpinionArticle = segments.length === 3 && segments[0] === 'opinions'
    if (isOpinionArticle) return

    // Generate session ID unik per load halaman
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID()
    }
    const sessionId = sessionIdRef.current

    // 1. Rekam Page View
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        path: pathname,
        session_id: sessionId
      }),
      keepalive: true
    }).catch(() => {})

    // 2. Rekam Scroll Depth
    let maxScroll = 0
    const thresholds = [25, 50, 75, 100]
    const tracked = new Set<number>()

    const handleScroll = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      )
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        thresholds.forEach(threshold => {
          if (maxScroll >= threshold && !tracked.has(threshold)) {
            tracked.add(threshold)
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_type: 'scroll_depth',
                path: pathname,
                session_id: sessionId,
                metadata: { depth: threshold }
              }),
              keepalive: true
            }).catch(() => {})
          }
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return null
}
