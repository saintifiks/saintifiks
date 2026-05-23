// API route: /api/admin/opinions/reports
// GET   — admin mengambil semua laporan artikel
// PATCH — admin menandai laporan sebagai reviewed

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET — semua laporan dengan detail artikel dan reporter
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // 'pending' | 'reviewed' | 'all'

    const adminClient = createAdminClient()

    let query = adminClient
      .from('article_reports')
      .select(`
        id,
        reason,
        status,
        created_at,
        reporter_user_id,
        opinion_article_id,
        opinion_articles(
          id,
          title,
          slug,
          status,
          author_id,
          user_profiles!opinion_articles_author_id_fkey(username, display_name)
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('[admin/opinions/reports GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil laporan' }, { status: 500 })
    }

    // Ambil display_name reporter dari user_profiles
    const reporterIds = (reports ?? [])
      .map((r) => r.reporter_user_id)
      .filter(Boolean) as string[]

    let reporterProfiles: Record<string, string> = {}
    if (reporterIds.length > 0) {
      const { data: profiles } = await adminClient
        .from('user_profiles')
        .select('user_id, display_name, username')
        .in('user_id', reporterIds)

      reporterProfiles = Object.fromEntries(
        (profiles ?? []).map((p) => [p.user_id, p.display_name || p.username])
      )
    }

    const result = (reports ?? []).map((r) => {
      const article = Array.isArray(r.opinion_articles) ? r.opinion_articles[0] : r.opinion_articles
      const rawProfile = article
        ? (article as unknown as { user_profiles: unknown }).user_profiles
        : null
      const authorProfile = Array.isArray(rawProfile)
        ? (rawProfile[0] as { username: string; display_name: string } | undefined) ?? null
        : (rawProfile as { username: string; display_name: string } | null)

      return {
        id: r.id,
        reason: r.reason,
        status: r.status,
        created_at: r.created_at,
        reporter_display_name: r.reporter_user_id
          ? (reporterProfiles[r.reporter_user_id] ?? 'Pengguna')
          : 'Anonim',
        article: article
          ? {
              id: (article as { id: string }).id,
              title: (article as { title: string }).title,
              slug: (article as { slug: string }).slug,
              status: (article as { status: string }).status,
              author: authorProfile
                ? {
                    username: (authorProfile as { username: string }).username,
                    display_name: (authorProfile as { display_name: string }).display_name,
                  }
                : null,
            }
          : null,
      }
    })

    return NextResponse.json({ reports: result })
  } catch (err) {
    console.error('[admin/opinions/reports GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH — tandai laporan sebagai reviewed
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const reportId = typeof body.report_id === 'string' ? body.report_id.trim() : ''

    if (!reportId) {
      return NextResponse.json({ error: 'report_id wajib diisi' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('article_reports')
      .update({ status: 'reviewed' })
      .eq('id', reportId)

    if (error) {
      console.error('[admin/opinions/reports PATCH] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengupdate laporan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/opinions/reports PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
