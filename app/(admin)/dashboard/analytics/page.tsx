// Halaman Analytics Dashboard — data interaksi per artikel untuk admin
// Server Component: semua query di server via admin client (bypass RLS)

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-check'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import { EmptyState, StatRow, adminLink, table } from '@/components/admin/ui'
import { formatTanggalPendek } from '@/lib/format-date'

export const dynamic = 'force-dynamic'

type ArticleStats = {
  id: string
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
  likes: number
  comments: number
  shares: number
  page_views: number
  avg_scroll: number
}

export default async function AnalyticsPage() {
  await requireAdmin()
  const admin = createAdminClient()

  // Ambil semua artikel
  const { data: articles } = await admin
    .from('articles')
    .select('id, title, slug, is_published, published_at')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (!articles || articles.length === 0) {
    return (
      <main aria-labelledby="analytics-title">
        <PageHeader
          titleId="analytics-title"
          eyebrow="Wawasan"
          title="Analitik"
          breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Analitik' }]}
        />
        <EmptyState title="Belum ada artikel" />
      </main>
    )
  }

  const articleIds = articles.map((a) => a.id)

  // Query semua tabel secara paralel
  const [
    { data: likesData },
    { data: commentsData },
    { data: sharesData },
    { data: pageViewsData },
    { data: scrollData },
  ] = await Promise.all([
    admin.from('likes').select('article_id').in('article_id', articleIds),
    admin.from('comments').select('article_id').in('article_id', articleIds),
    admin.from('shares').select('article_id, platform').in('article_id', articleIds),
    // page_view: path berformat /artikel/[slug]
    admin
      .from('analytics_events')
      .select('path')
      .eq('event_type', 'page_view')
      .like('path', '/artikel/%'),
    // scroll_depth 100% sebagai proxy "baca tuntas"
    admin
      .from('analytics_events')
      .select('path, metadata')
      .eq('event_type', 'scroll_depth')
      .like('path', '/artikel/%'),
  ])

  // Build slug → articleId map
  const slugToId: Record<string, string> = {}
  articles.forEach((a) => { slugToId[`/artikel/${a.slug}`] = a.id })

  // Agregasi per artikel
  const likesCount: Record<string, number> = {}
  const commentsCount: Record<string, number> = {}
  const sharesCount: Record<string, number> = {}
  const pageViewsCount: Record<string, number> = {}
  const scrollDepthSum: Record<string, number> = {}
  const scrollDepthN: Record<string, number> = {}

  likesData?.forEach(({ article_id }) => {
    likesCount[article_id] = (likesCount[article_id] || 0) + 1
  })

  commentsData?.forEach(({ article_id }) => {
    commentsCount[article_id] = (commentsCount[article_id] || 0) + 1
  })

  sharesData?.forEach(({ article_id }) => {
    sharesCount[article_id] = (sharesCount[article_id] || 0) + 1
  })

  pageViewsData?.forEach(({ path }) => {
    const id = slugToId[path]
    if (id) pageViewsCount[id] = (pageViewsCount[id] || 0) + 1
  })

  scrollData?.forEach(({ path, metadata }) => {
    const id = slugToId[path]
    if (id && typeof metadata?.depth === 'number') {
      scrollDepthSum[id] = (scrollDepthSum[id] || 0) + metadata.depth
      scrollDepthN[id] = (scrollDepthN[id] || 0) + 1
    }
  })

  // Gabungkan ke array stats
  const stats: ArticleStats[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    is_published: a.is_published,
    published_at: a.published_at,
    likes: likesCount[a.id] || 0,
    comments: commentsCount[a.id] || 0,
    shares: sharesCount[a.id] || 0,
    page_views: pageViewsCount[a.id] || 0,
    avg_scroll: scrollDepthN[a.id]
      ? Math.round(scrollDepthSum[a.id] / scrollDepthN[a.id])
      : 0,
  }))

  // Totals untuk summary card
  const totals = stats.reduce(
    (acc, s) => ({
      likes: acc.likes + s.likes,
      comments: acc.comments + s.comments,
      shares: acc.shares + s.shares,
      page_views: acc.page_views + s.page_views,
    }),
    { likes: 0, comments: 0, shares: 0, page_views: 0 }
  )

  return (
    <main aria-labelledby="analytics-title">
      <PageHeader
        titleId="analytics-title"
        eyebrow="Wawasan"
        title="Analitik"
        description="Interaksi pembaca per artikel. Diperbarui setiap kali halaman dibuka."
        breadcrumbs={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Analitik' }]}
      />

      <StatRow
        items={[
          { label: 'Tampilan', value: totals.page_views.toLocaleString('id-ID') },
          { label: 'Suka', value: totals.likes.toLocaleString('id-ID') },
          { label: 'Komentar', value: totals.comments.toLocaleString('id-ID') },
          { label: 'Bagikan', value: totals.shares.toLocaleString('id-ID') },
        ]}
      />

      <section aria-labelledby="per-artikel-heading" className="mt-12">
        <h2 id="per-artikel-heading" className="mb-4 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
          Per artikel · {stats.length}
        </h2>

        <div className={table.wrap}>
          <table className={table.root}>
            <caption className="sr-only">Interaksi per artikel</caption>
            <thead>
              <tr className={table.headRow}>
                <th scope="col" className={table.th}>Judul</th>
                <th scope="col" className={`${table.th} text-right`}>Tampil</th>
                <th scope="col" className={`${table.th} text-right`}>Suka</th>
                <th scope="col" className={`${table.th} text-right`}>Komentar</th>
                <th scope="col" className={`${table.th} text-right`}>Bagikan</th>
                <th scope="col" className={`${table.th} text-right`}>Gulir</th>
              </tr>
            </thead>
            <tbody className={table.bodyRows}>
              {stats.map((artikel) => (
                <tr key={artikel.id}>
                  <th scope="row" className={`${table.td} min-w-[16rem] font-normal`}>
                    <Link href={`/artikel/${artikel.slug}`} target="_blank" rel="noopener noreferrer" className={`font-display text-base leading-snug text-text-primary ${adminLink}`}>
                      {artikel.title}
                    </Link>
                    <p className="mt-1 font-mono text-caption text-text-tertiary">
                      {artikel.is_published
                        ? artikel.published_at
                          ? formatTanggalPendek(artikel.published_at)
                          : 'Terbit'
                        : 'Draf'}
                    </p>
                  </th>
                  {[artikel.page_views, artikel.likes, artikel.comments, artikel.shares].map((n, i) => (
                    <td key={i} className={`${table.td} text-right font-mono text-caption tabular-nums text-text-secondary`}>
                      {n.toLocaleString('id-ID')}
                    </td>
                  ))}
                  <td className={`${table.td} text-right font-mono text-caption tabular-nums text-text-secondary`}>
                    {artikel.avg_scroll}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-caption text-text-tertiary">
          Gulir = rata-rata kedalaman gulir pembaca (proxy “dibaca tuntas”).
        </p>
      </section>
    </main>
  )
}
