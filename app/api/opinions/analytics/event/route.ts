// API route: /api/opinions/analytics/event
// POST — menerima analytics event dari client (page_view, scroll depth)
// Bisa dikirim oleh pengunjung anonim maupun yang login

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const VALID_EVENTS = ['page_view', 'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const opinionArticleId = typeof body.opinion_article_id === 'string' ? body.opinion_article_id.trim() : ''
    const eventType = typeof body.event_type === 'string' ? body.event_type.trim() : ''
    const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : null

    if (!opinionArticleId || !VALID_EVENTS.includes(eventType)) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const supabase = await createClient()

    // user_id opsional — pengunjung anonim boleh kirim event
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('opinion_analytics_events')
      .insert({
        opinion_article_id: opinionArticleId,
        event_type: eventType,
        user_id: user?.id ?? null,
        session_id: sessionId,
      })

    if (error) {
      console.error('[opinions/analytics/event POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal menyimpan event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[opinions/analytics/event POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
