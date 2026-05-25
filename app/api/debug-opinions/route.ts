// DEBUG ROUTE — HAPUS SETELAH MASALAH TERIDENTIFIKASI
// GET /api/debug-opinions — cek query opinions dengan admin client

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: Admin client — count semua artikel tanpa filter
  try {
    const admin = createAdminClient()
    const { data: all, error: e1, count: c1 } = await admin
      .from('opinion_articles')
      .select('id, title, status, author_id', { count: 'exact' })
      .limit(10)
    results.admin_all = { data: all, error: e1?.message, count: c1 }
  } catch (err) {
    results.admin_all = { thrown: String(err) }
  }

  // Test 2: Admin client — hanya published
  try {
    const admin = createAdminClient()
    const { data: pub, error: e2, count: c2 } = await admin
      .from('opinion_articles')
      .select('id, title, status', { count: 'exact' })
      .eq('status', 'published')
    results.admin_published = { data: pub, error: e2?.message, count: c2 }
  } catch (err) {
    results.admin_published = { thrown: String(err) }
  }

  // Test 3: Anon client (server) — hanya published
  try {
    const anon = await createClient()
    const { data: anonPub, error: e3, count: c3 } = await anon
      .from('opinion_articles')
      .select('id, title, status', { count: 'exact' })
      .eq('status', 'published')
    results.anon_published = { data: anonPub, error: e3?.message, count: c3 }
  } catch (err) {
    results.anon_published = { thrown: String(err) }
  }

  return NextResponse.json(results)
}
