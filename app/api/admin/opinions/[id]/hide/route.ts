// API route: /api/admin/opinions/[id]/hide
// POST   — admin menyembunyikan (takedown) artikel
// DELETE — admin merestore artikel yang di-hidden ke published

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-check'
import { setOpinionHiddenStatus } from '@/lib/security/capabilities/moderation'
import { validateUUID, ValidationError } from '@/lib/security/validation'
import { logSecurityEvent } from '@/lib/security/audit'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST — hide/takedown artikel
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!(await isAdmin())) {
      logSecurityEvent({
        event: 'AUTHZ_DENIED',
        actorId: user?.id ?? null,
        resourceType: 'opinion_article',
        resourceId: params.id,
        result: 'denied',
        reasonCode: 'NOT_ADMIN',
      })
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const opinionId = validateUUID(params.id, 'Opinion ID')

    const { error } = await setOpinionHiddenStatus(opinionId, true)

    if (error) {
      console.error('[admin/opinions/[id]/hide POST] Database error occurred.')
      return NextResponse.json({ error: 'Gagal memproses permintaan.' }, { status: 500 })
    }

    logSecurityEvent({
      event: 'OPINION_HIDE',
      actorId: user?.id ?? null,
      resourceType: 'opinion_article',
      resourceId: opinionId,
      result: 'success',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 })
    }
    console.error('[admin/opinions/[id]/hide POST] Unexpected error occurred.')
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

// DELETE — restore artikel ke published
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!(await isAdmin())) {
      logSecurityEvent({
        event: 'AUTHZ_DENIED',
        actorId: user?.id ?? null,
        resourceType: 'opinion_article',
        resourceId: params.id,
        result: 'denied',
        reasonCode: 'NOT_ADMIN',
      })
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const opinionId = validateUUID(params.id, 'Opinion ID')

    const { error } = await setOpinionHiddenStatus(opinionId, false)

    if (error) {
      console.error('[admin/opinions/[id]/hide DELETE] Database error occurred.')
      return NextResponse.json({ error: 'Gagal memproses permintaan.' }, { status: 500 })
    }

    logSecurityEvent({
      event: 'OPINION_RESTORE',
      actorId: user?.id ?? null,
      resourceType: 'opinion_article',
      resourceId: opinionId,
      result: 'success',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 })
    }
    console.error('[admin/opinions/[id]/hide DELETE] Unexpected error occurred.')
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
