// API route: /api/opinions/[id]/like
// GET    — cek apakah user sudah like artikel ini + jumlah like
// POST   — tambah like (upsert idempotent)
// DELETE — unlike

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET — status like user + total count
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Cek apakah user sudah like
    const { data: userLike } = await adminClient
      .from('opinion_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('opinion_article_id', params.id)
      .maybeSingle()

    // Hitung total likes
    const { count } = await adminClient
      .from('opinion_likes')
      .select('*', { count: 'exact', head: true })
      .eq('opinion_article_id', params.id)

    return NextResponse.json({
      liked: !!userLike,
      count: count ?? 0,
    })
  } catch (err) {
    console.error('[opinions/[id]/like GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — tambah like
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Upsert — idempotent: jika sudah like, tidak error
    await adminClient
      .from('opinion_likes')
      .upsert(
        { user_id: user.id, opinion_article_id: params.id },
        { onConflict: 'user_id,opinion_article_id' }
      )

    const { count } = await adminClient
      .from('opinion_likes')
      .select('*', { count: 'exact', head: true })
      .eq('opinion_article_id', params.id)

    return NextResponse.json({ liked: true, count: count ?? 0 })
  } catch (err) {
    console.error('[opinions/[id]/like POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — unlike
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

    const adminClient = createAdminClient()

    await adminClient
      .from('opinion_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('opinion_article_id', params.id)

    const { count } = await adminClient
      .from('opinion_likes')
      .select('*', { count: 'exact', head: true })
      .eq('opinion_article_id', params.id)

    return NextResponse.json({ liked: false, count: count ?? 0 })
  } catch (err) {
    console.error('[opinions/[id]/like DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
