// API route: /api/opinion-charts
// POST — membuat chart baru untuk artikel opinions

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()
    const opinionArticleId = typeof body.opinion_article_id === 'string' ? body.opinion_article_id.trim() : ''
    const chartId = typeof body.chart_id === 'string' ? body.chart_id.trim() : ''
    const config = body.config

    if (!opinionArticleId) {
      return NextResponse.json({ error: 'opinion_article_id wajib diisi' }, { status: 400 })
    }
    if (!chartId) {
      return NextResponse.json({ error: 'chart_id wajib diisi' }, { status: 400 })
    }
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config chart tidak valid' }, { status: 400 })
    }

    // Validasi: artikel harus milik user yang sedang login
    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id, author_id')
      .eq('id', opinionArticleId)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan atau bukan milik kamu' },
        { status: 403 }
      )
    }

    const { data: chart, error } = await supabase
      .from('opinion_article_charts')
      .insert({
        opinion_article_id: opinionArticleId,
        chart_id: chartId,
        config,
      })
      .select()
      .single()

    if (error) {
      console.error('[opinion-charts POST] Error:', error.message)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'chart_id sudah digunakan di artikel ini' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Gagal membuat chart' }, { status: 500 })
    }

    return NextResponse.json({ chart }, { status: 201 })
  } catch (err) {
    console.error('[opinion-charts POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
