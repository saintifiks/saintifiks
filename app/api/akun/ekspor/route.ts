// GET /api/akun/ekspor — unduh semua data milik pembaca yang sedang masuk sebagai satu berkas JSON.
// Setiap kueri disaring ke user_id pembaca (selain RLS) agar tulisan terbit milik orang lain tidak ikut.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })

  const [profile, articles, comments, opinionComments, likes, opinionLikes, bookmarks, articleCorrections, opinionCorrections] =
    await Promise.all([
      supabase.from('user_profiles').select('username, display_name, bio, avatar_url, created_at').eq('user_id', user.id).maybeSingle(),
      supabase.from('opinion_articles').select('id, title, slug, excerpt, content, studio_document, cover_image_url, status, published_at, created_at, updated_at').eq('author_id', user.id),
      supabase.from('comments').select('id, article_id, content, created_at').eq('user_id', user.id),
      supabase.from('opinion_comments').select('id, opinion_article_id, content, created_at').eq('user_id', user.id),
      supabase.from('likes').select('article_id, created_at').eq('user_id', user.id),
      supabase.from('opinion_likes').select('opinion_article_id, created_at').eq('user_id', user.id),
      supabase.from('bookmarks').select('article_id, created_at').eq('user_id', user.id),
      supabase.from('article_corrections').select('id, article_id, original_text, corrected_text, explanation, status, created_at').eq('user_id', user.id),
      supabase.from('opinion_corrections').select('id, opinion_article_id, original_text, corrected_text, explanation, status, created_at').eq('user_id', user.id),
    ])

  logSecurityEvent({ event: 'ACCOUNT_EXPORT', actorId: user.id, resourceType: 'account', resourceId: user.id, result: 'success' })

  const body = {
    diekspor_pada: new Date().toISOString(),
    akun: { email: user.email ?? null, dibuat_pada: user.created_at },
    profil: profile.data ?? null,
    tulisan_argumen: articles.data ?? [],
    komentar_artikel: comments.data ?? [],
    komentar_argumen: opinionComments.data ?? [],
    suka_artikel: likes.data ?? [],
    suka_argumen: opinionLikes.data ?? [],
    daftar_bacaan: bookmarks.data ?? [],
    koreksi_artikel: articleCorrections.data ?? [],
    koreksi_argumen: opinionCorrections.data ?? [],
  }

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="saintifiks-data-saya.json"',
      'Cache-Control': 'no-store',
    },
  })
}
