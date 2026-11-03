// /api/bookmarks — Daftar Bacaan pribadi.
//  GET    ?articleId=…  → { saved: boolean }
//  POST   { articleId } → simpan
//  DELETE { articleId } → hapus dari simpanan
// Memakai klien sesi pengguna (bukan service_role): RLS di tabel `bookmarks` memastikan setiap pengguna hanya
// dapat membaca, menambah, dan menghapus baris miliknya sendiri.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { validateUUID, ValidationError } from '@/lib/security/validation'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { supabase, user: error ? null : user }
}

function limited(request: NextRequest) {
  const rl = checkRateLimit(`bookmarks:${getClientIP(request)}`, RATE_LIMITS.bookmarks.limit, RATE_LIMITS.bookmarks.windowMs)
  return rl.success ? null : NextResponse.json({ error: 'Terlalu banyak aksi. Silakan tunggu sebentar.' }, { status: 429 })
}

export async function GET(request: NextRequest) {
  try {
    const articleId = validateUUID(new URL(request.url).searchParams.get('articleId'), 'Artikel')
    const { supabase, user } = await currentUser()
    if (!user) return NextResponse.json({ saved: false }, { headers: NO_STORE })

    const { data } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle()
    return NextResponse.json({ saved: !!data }, { headers: NO_STORE })
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = limited(request)
    if (blocked) return blocked
    const body = await request.json().catch(() => ({}))
    const articleId = validateUUID(body?.articleId, 'Artikel')
    const { supabase, user } = await currentUser()
    if (!user) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })

    const { error } = await supabase
      .from('bookmarks')
      .upsert({ user_id: user.id, article_id: articleId }, { onConflict: 'user_id,article_id', ignoreDuplicates: true })
    if (error) {
      // 23503 = artikel tidak ada
      const status = error.code === '23503' ? 404 : 500
      return NextResponse.json({ error: status === 404 ? 'Artikel tidak ditemukan' : 'Gagal menyimpan' }, { status })
    }
    return NextResponse.json({ saved: true }, { headers: NO_STORE })
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const blocked = limited(request)
    if (blocked) return blocked
    const body = await request.json().catch(() => ({}))
    const articleId = validateUUID(body?.articleId, 'Artikel')
    const { supabase, user } = await currentUser()
    if (!user) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })

    const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('article_id', articleId)
    if (error) return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 })
    return NextResponse.json({ saved: false }, { headers: NO_STORE })
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
