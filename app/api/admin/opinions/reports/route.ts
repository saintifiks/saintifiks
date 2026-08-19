// API route: /api/admin/opinions/reports
// GET   — admin mengambil semua laporan artikel
// PATCH — admin menandai laporan sebagai reviewed

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateUUID, validateEnum, ValidationError } from '@/lib/security/validation'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUS_FILTERS = ['pending', 'reviewed', 'dismissed', 'all'] as const

// GET — semua laporan dengan detail artikel dan reporter
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rawStatus = searchParams.get('status') ?? 'all'

    let statusFilter: string
    try {
      statusFilter = validateEnum(rawStatus, ALLOWED_STATUS_FILTERS, 'Status filter')
    } catch {
      statusFilter = 'all'
    }

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
  } catch {
    console.error('[admin/opinions/reports GET] Unexpected error occurred.')
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

// PATCH — tandai laporan sebagai reviewed atau dismissed
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const reportId = validateUUID(body.report_id, 'Report ID')
    const newStatus = validateEnum(body.status ?? 'reviewed', ['reviewed', 'dismissed'] as const, 'Status')

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('article_reports')
      .update({ status: newStatus })
      .eq('id', reportId)

    if (error) {
      console.error('[admin/opinions/reports PATCH] Database error occurred.')
      return NextResponse.json({ error: 'Gagal memperbarui laporan.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'Data permintaan tidak valid.' }, { status: 400 })
    }
    console.error('[admin/opinions/reports PATCH] Unexpected error occurred.')
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
