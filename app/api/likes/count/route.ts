import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// API endpoint untuk mendapatkan jumlah like suatu artikel
// GET /api/likes/count?articleId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId diperlukan' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId)

    if (error) {
      console.error('Error fetching likes count:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil jumlah like' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
