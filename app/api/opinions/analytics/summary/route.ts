// API route: /api/opinions/analytics/summary
// GET — tren views 7 hari terakhir untuk semua artikel milik user yang login

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Ambil article IDs milik user
    const { data: articles } = await supabase
      .from('opinion_articles')
      .select('id, title')
      .eq('author_id', user.id)

    if (!articles || articles.length === 0) {
      return NextResponse.json({ daily_views: [], article_stats: [] })
    }

    const articleIds = articles.map((a) => a.id)

    // Ambil events 7 hari terakhir
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: events } = await supabase
      .from('opinion_analytics_events')
      .select('opinion_article_id, event_type, created_at')
      .in('opinion_article_id', articleIds)
      .eq('event_type', 'page_view')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Agregat views per hari (format: YYYY-MM-DD)
    const dailyMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = 0
    }

    for (const event of events ?? []) {
      const day = event.created_at.split('T')[0]
      if (day in dailyMap) {
        dailyMap[day]++
      }
    }

    const dailyViews = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Agregat per artikel: total views, total likes, scroll depth rata-rata
    const { data: allEvents } = await supabase
      .from('opinion_analytics_events')
      .select('opinion_article_id, event_type')
      .in('opinion_article_id', articleIds)

    const { data: allLikes } = await supabase
      .from('opinion_likes')
      .select('opinion_article_id')
      .in('opinion_article_id', articleIds)

    const articleStats = articles.map((a) => {
      const articleEvents = (allEvents ?? []).filter((e) => e.opinion_article_id === a.id)
      const views = articleEvents.filter((e) => e.event_type === 'page_view').length
      const scroll100 = articleEvents.filter((e) => e.event_type === 'scroll_100').length
      const likes = (allLikes ?? []).filter((l) => l.opinion_article_id === a.id).length
      const avgScrollDepth = views > 0 ? Math.round((scroll100 / views) * 100) : 0

      return {
        id: a.id,
        title: a.title,
        views,
        likes,
        avg_scroll_depth: avgScrollDepth,
      }
    })

    return NextResponse.json({ daily_views: dailyViews, article_stats: articleStats })
  } catch (err) {
    console.error('[opinions/analytics/summary GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
