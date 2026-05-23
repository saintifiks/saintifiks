// Halaman Analytics Dashboard — data interaksi per artikel untuk admin
// Server Component: semua query di server via admin client (bypass RLS)

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Eye, TrendingUp } from 'lucide-react'

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

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatBadge({ value, icon }: { value: number; icon: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 font-helvetica text-xs text-primary-dark/60">
      {icon}
      {value}
    </span>
  )
}

export default async function AnalyticsPage() {
  // Verifikasi admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Ambil semua artikel
  const { data: articles } = await admin
    .from('articles')
    .select('id, title, slug, is_published, published_at')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (!articles || articles.length === 0) {
    return (
      <main className="min-h-screen bg-primary-light">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <Link href="/dashboard" className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors">
              ← Dashboard
            </Link>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-3">Analytics</h1>
          </div>
          <p className="font-helvetica text-sm text-primary-dark/40">Belum ada artikel.</p>
        </div>
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
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/dashboard" className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors">
              ← Dashboard
            </Link>
            <h1 className="font-libre text-3xl font-bold text-primary-dark mt-3">Analytics</h1>
            <p className="font-helvetica text-sm text-primary-dark/40 mt-1">
              Data interaksi per artikel — diperbarui setiap kali halaman dibuka
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="border border-primary-dark/10 p-5">
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">Total Views</p>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-primary-dark/40" />
              <span className="font-libre text-2xl font-bold text-primary-dark">{totals.page_views.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="border border-primary-dark/10 p-5">
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">Total Likes</p>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-accent-red/60" />
              <span className="font-libre text-2xl font-bold text-primary-dark">{totals.likes.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="border border-primary-dark/10 p-5">
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">Total Komentar</p>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-primary-dark/40" />
              <span className="font-libre text-2xl font-bold text-primary-dark">{totals.comments.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="border border-primary-dark/10 p-5">
            <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">Total Share</p>
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-primary-dark/40" />
              <span className="font-libre text-2xl font-bold text-primary-dark">{totals.shares.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Tabel per artikel */}
        <section>
          <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-4">
            Per Artikel ({stats.length})
          </h2>

          <div className="border border-primary-dark/10">
            {/* Header tabel */}
            <div className="hidden sm:grid grid-cols-[1fr_72px_72px_72px_72px_80px] px-5 py-3 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Judul</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Views</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Likes</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Komentar</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Share</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Scroll Avg</span>
            </div>

            {stats.map((artikel) => (
              <div
                key={artikel.id}
                className="px-5 py-4 border-b border-primary-dark/10 last:border-b-0 hover:bg-primary-dark/[0.015] transition-colors"
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-[1fr_72px_72px_72px_72px_80px] items-center gap-2">
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/artikel/${artikel.slug}`}
                      target="_blank"
                      className="font-libre text-sm font-bold text-primary-dark hover:text-accent-blue transition-colors leading-snug line-clamp-2"
                    >
                      {artikel.title}
                    </Link>
                    <span className={`font-helvetica text-xs mt-0.5 inline-block ${artikel.is_published ? 'text-primary-dark/30' : 'text-primary-dark/20'}`}>
                      {artikel.is_published
                        ? artikel.published_at ? formatTanggal(artikel.published_at) : 'Diterbitkan'
                        : 'Draft'}
                    </span>
                  </div>
                  <span className="font-helvetica text-sm text-primary-dark/70 text-center">{artikel.page_views}</span>
                  <span className="font-helvetica text-sm text-primary-dark/70 text-center">{artikel.likes}</span>
                  <span className="font-helvetica text-sm text-primary-dark/70 text-center">{artikel.comments}</span>
                  <span className="font-helvetica text-sm text-primary-dark/70 text-center">{artikel.shares}</span>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={12} className="text-primary-dark/30" />
                    <span className="font-helvetica text-sm text-primary-dark/70">{artikel.avg_scroll}%</span>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden">
                  <Link
                    href={`/artikel/${artikel.slug}`}
                    target="_blank"
                    className="font-libre text-sm font-bold text-primary-dark hover:text-accent-blue transition-colors leading-snug block mb-2"
                  >
                    {artikel.title}
                  </Link>
                  <div className="flex items-center gap-4 flex-wrap">
                    <StatBadge value={artikel.page_views} icon={<Eye size={12} />} />
                    <StatBadge value={artikel.likes} icon={<Heart size={12} />} />
                    <StatBadge value={artikel.comments} icon={<MessageCircle size={12} />} />
                    <StatBadge value={artikel.shares} icon={<Share2 size={12} />} />
                    <StatBadge value={artikel.avg_scroll} icon={<TrendingUp size={12} />} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
