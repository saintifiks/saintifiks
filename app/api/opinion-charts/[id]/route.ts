// API route: /api/opinion-charts/[id]
// PATCH  — update chart config
// DELETE — hapus chart

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// PATCH — update chart config
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()
    const config = body.config

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config chart tidak valid' }, { status: 400 })
    }

    // Verifikasi bahwa chart ini milik artikel user yang sedang login
    const { data: chart } = await supabase
      .from('opinion_article_charts')
      .select('id, opinion_article_id')
      .eq('id', params.id)
      .maybeSingle()

    if (!chart) {
      return NextResponse.json({ error: 'Chart tidak ditemukan' }, { status: 404 })
    }

    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id')
      .eq('id', chart.opinion_article_id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { data: updated, error } = await supabase
      .from('opinion_article_charts')
      .update({ config })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[opinion-charts/[id] PATCH] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengupdate chart' }, { status: 500 })
    }

    return NextResponse.json({ chart: updated })
  } catch (err) {
    console.error('[opinion-charts/[id] PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — hapus chart
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: chart } = await supabase
      .from('opinion_article_charts')
      .select('id, opinion_article_id')
      .eq('id', params.id)
      .maybeSingle()

    if (!chart) {
      return NextResponse.json({ error: 'Chart tidak ditemukan' }, { status: 404 })
    }

    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id')
      .eq('id', chart.opinion_article_id)
      .eq('author_id', user.id)
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { error } = await supabase
      .from('opinion_article_charts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[opinion-charts/[id] DELETE] Error:', error.message)
      return NextResponse.json({ error: 'Gagal menghapus chart' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[opinion-charts/[id] DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
