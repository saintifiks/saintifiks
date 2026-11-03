// Moderasi Argumen — laporan pembaca yang menunggu dan semua tulisan Argumen yang tayang atau disembunyikan.

import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/admin/PageHeader'
import OpinionsModeratorClient from '@/components/opinions/OpinionsModeratorClient'

export const metadata: Metadata = { title: 'Argumen — Admin Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function OpinionsModerationPage() {
  await requireAdmin()
  const adminClient = createAdminClient()

  // Laporan yang menunggu keputusan
  const { data: reports } = await adminClient
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
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Semua tulisan Argumen yang tayang atau disembunyikan
  const { data: articles } = await adminClient
    .from('opinion_articles')
    .select(`
      id,
      title,
      slug,
      status,
      published_at,
      created_at,
      author_id,
      user_profiles!opinion_articles_author_id_fkey(username, display_name)
    `)
    .in('status', ['published', 'hidden'])
    .order('published_at', { ascending: false })
    .limit(100)

  return (
    <main aria-labelledby="argumen-title">
      <PageHeader
        titleId="argumen-title"
        eyebrow="Konten"
        title="Argumen"
        description="Tulisan pembaca terbit tanpa penyuntingan. Di sini Anda meninjau laporan dan menyembunyikan yang melanggar pedoman."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Argumen' }]}
      />

      <OpinionsModeratorClient initialReports={reports ?? []} initialArticles={articles ?? []} />
    </main>
  )
}
