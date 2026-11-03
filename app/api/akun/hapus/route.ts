// POST /api/akun/hapus — hapus akun pembaca yang sedang masuk secara permanen (auth.users; profil, tulisan Argumen,
// komentar, suka, dan Daftar Bacaan ikut terhapus lewat ON DELETE CASCADE, usulan koreksi artikel dikosongkan
// pengirimnya). Dijaga berlapis: sesi masuk, asal permintaan, kata konfirmasi, dan akun redaksi ditolak.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin-check'
import { logSecurityEvent } from '@/lib/security/audit'
import { validateMutationRequestIntegrity } from '@/lib/security/request-integrity'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const integrity = validateMutationRequestIntegrity(request.headers)
  if (!integrity.allowed) {
    return NextResponse.json({ error: 'Permintaan ditolak.' }, { status: 403 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  const konfirmasi = body && typeof body === 'object' && 'konfirmasi' in body ? (body as { konfirmasi: unknown }).konfirmasi : null
  if (konfirmasi !== 'HAPUS') {
    return NextResponse.json({ error: 'Ketik HAPUS untuk mengonfirmasi.' }, { status: 400 })
  }

  if (await isAdmin()) {
    logSecurityEvent({
      event: 'ACCOUNT_DELETE',
      actorId: user.id,
      resourceType: 'account',
      resourceId: user.id,
      result: 'denied',
      reasonCode: 'ADMIN_ACCOUNT',
    })
    return NextResponse.json({ error: 'Akun redaksi tidak bisa dihapus dari sini.' }, { status: 403 })
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[akun/hapus] Penghapusan akun gagal.')
    logSecurityEvent({
      event: 'ACCOUNT_DELETE',
      actorId: user.id,
      resourceType: 'account',
      resourceId: user.id,
      result: 'failure',
    })
    return NextResponse.json({ error: 'Akun belum berhasil dihapus. Coba lagi atau hubungi kami.' }, { status: 500 })
  }

  logSecurityEvent({ event: 'ACCOUNT_DELETE', actorId: user.id, resourceType: 'account', resourceId: user.id, result: 'success' })
  await supabase.auth.signOut().catch(() => {})
  return NextResponse.json({ ok: true })
}
