// API route: /api/admin/opinions
// GET — admin mengambil semua artikel opinions untuk moderasi
// Menggunakan service_role key untuk bypass RLS

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // 'published' | 'hidden' | 'all'
    const hasReports = searchParams.get('has_reports') === 'true'

    const adminClient = createAdminClient()

    // Ambil semua artikel dengan info author dan jumlah laporan pending
    let query = adminClient
      .from('opinion_articles')
      .select(`
        id,
        title,
        slug,
        status,
        published_at,
        created_at,
        updated_at,
        author_id,
        user_profiles!opinion_articles_author_id_fkey(username, display_name),
        article_reports(count)
      `)
      .order('published_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('[admin/opinions GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
    }

    // Normalisasi dan filter jika has_reports=true
    let result = (articles ?? []).map((a) => {
      const profile = Array.isArray(a.user_profiles) ? a.user_profiles[0] : a.user_profiles
      const reportCount = Array.isArray(a.article_reports)
        ? (a.article_reports[0] as { count: number })?.count ?? 0
        : 0

      return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        published_at: a.published_at,
        created_at: a.created_at,
        author: profile
          ? { username: (profile as { username: string; display_name: string }).username, display_name: (profile as { username: string; display_name: string }).display_name }
          : null,
        pending_report_count: reportCount,
      }
    })

    if (hasReports) {
      result = result.filter((a) => a.pending_report_count > 0)
    }

    // Urutkan: artikel dengan laporan di atas
    result.sort((a, b) => {
      if (b.pending_report_count !== a.pending_report_count) {
        return b.pending_report_count - a.pending_report_count
      }
      return new Date(b.published_at ?? b.created_at).getTime() -
             new Date(a.published_at ?? a.created_at).getTime()
    })

    return NextResponse.json({ articles: result })
  } catch (err) {
    console.error('[admin/opinions GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
