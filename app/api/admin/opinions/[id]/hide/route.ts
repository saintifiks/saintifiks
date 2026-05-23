// API route: /api/admin/opinions/[id]/hide
// POST   — admin menyembunyikan (takedown) artikel
// DELETE — admin merestore artikel yang di-hidden ke published

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// POST — hide/takedown artikel
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('opinion_articles')
      .update({ status: 'hidden' })
      .eq('id', params.id)

    if (error) {
      console.error('[admin/opinions/[id]/hide POST] Error:', error.message)
      return NextResponse.json({ error: 'Gagal menyembunyikan artikel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/opinions/[id]/hide POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — restore artikel ke published
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('opinion_articles')
      .update({ status: 'published' })
      .eq('id', params.id)

    if (error) {
      console.error('[admin/opinions/[id]/hide DELETE] Error:', error.message)
      return NextResponse.json({ error: 'Gagal merestore artikel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/opinions/[id]/hide DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
