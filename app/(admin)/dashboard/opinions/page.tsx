// Halaman moderasi opinions untuk admin
// Menampilkan semua artikel + laporan yang masuk, dengan aksi hide/restore

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import OpinionsModeratorClient from '@/components/opinions/OpinionsModeratorClient'

export const dynamic = 'force-dynamic'

export default async function OpinionsModerationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/login')

  const adminClient = createAdminClient()

  // Ambil semua laporan pending
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

  // Ambil semua artikel opinions (published + hidden)
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
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Admin Panel
            </p>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-2">
              Moderasi Opinions
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="font-helvetica text-sm text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 mt-2"
          >
            ← Dashboard
          </Link>
        </div>

        <OpinionsModeratorClient
          initialReports={reports ?? []}
          initialArticles={articles ?? []}
        />

      </div>
    </main>
  )
}
