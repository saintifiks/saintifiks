// API route: /api/opinions/[id]/report
// POST — melaporkan artikel (user tidak bisa melaporkan artikelnya sendiri)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(
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
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

    // Validasi alasan laporan
    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: 'Alasan laporan minimal 10 karakter' },
        { status: 400 }
      )
    }
    if (reason.length > 500) {
      return NextResponse.json(
        { error: 'Alasan laporan maksimal 500 karakter' },
        { status: 400 }
      )
    }

    // Cek apakah artikel ada dan published
    const { data: article } = await supabase
      .from('opinion_articles')
      .select('id, author_id, status')
      .eq('id', params.id)
      .eq('status', 'published')
      .maybeSingle()

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    // User tidak bisa melaporkan artikelnya sendiri
    if (article.author_id === user.id) {
      return NextResponse.json(
        { error: 'Tidak bisa melaporkan artikel milik sendiri' },
        { status: 400 }
      )
    }

    // Insert laporan (unique constraint akan mencegah laporan duplikat)
    const { error } = await supabase
      .from('article_reports')
      .insert({
        opinion_article_id: params.id,
        reporter_user_id: user.id,
        reason,
        status: 'pending',
      })

    if (error) {
      console.error('[opinions/[id]/report POST] Error:', error.message)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Kamu sudah pernah melaporkan artikel ini' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Gagal mengirim laporan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[opinions/[id]/report POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
