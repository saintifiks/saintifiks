'use client'

// Client Component untuk aksi moderasi opinions (hide/restore/mark reviewed)

import { useState } from 'react'
import Link from 'next/link'

type Profile = { username: string; display_name: string }

type ReportArticle = {
  id: string
  title: string
  slug: string
  status: string
  author_id: string
  user_profiles: Profile | Profile[] | null
}

type Report = {
  id: string
  reason: string
  status: string
  created_at: string
  reporter_user_id: string | null
  opinion_article_id: string
  opinion_articles: ReportArticle | ReportArticle[] | null
}

type Article = {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  author_id: string
  user_profiles: Profile | Profile[] | null
}

type Props = {
  initialReports: Report[]
  initialArticles: Article[]
}

function getProfile(profiles: Profile | Profile[] | null): Profile | null {
  if (!profiles) return null
  return Array.isArray(profiles) ? profiles[0] ?? null : profiles
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OpinionsModeratorClient({ initialReports, initialArticles }: Props) {
  const [reports, setReports] = useState(initialReports)
  const [articles, setArticles] = useState(initialArticles)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function hideArticle(articleId: string) {
    setActionLoading(articleId)
    try {
      const res = await fetch(`/api/admin/opinions/${articleId}/hide`, { method: 'POST' })
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => a.id === articleId ? { ...a, status: 'hidden' } : a)
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function restoreArticle(articleId: string) {
    setActionLoading(articleId)
    try {
      const res = await fetch(`/api/admin/opinions/${articleId}/hide`, { method: 'DELETE' })
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => a.id === articleId ? { ...a, status: 'published' } : a)
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function markReviewed(reportId: string) {
    setActionLoading(reportId)
    try {
      const res = await fetch('/api/admin/opinions/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId }),
      })
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-14">

      {/* Laporan masuk */}
      <section>
        <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-5">
          Laporan Masuk ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="border border-primary-dark/10 py-12 text-center">
            <p className="font-helvetica text-sm text-primary-dark/40">
              Tidak ada laporan pending.
            </p>
          </div>
        ) : (
          <div className="border border-primary-dark/10 divide-y divide-primary-dark/10">
            {reports.map((report) => {
              const article = Array.isArray(report.opinion_articles)
                ? report.opinion_articles[0]
                : report.opinion_articles
              const author = article ? getProfile(article.user_profiles) : null

              return (
                <div key={report.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-helvetica text-xs text-primary-dark/40">
                          {formatTanggal(report.created_at)}
                        </span>
                        {author && (
                          <span className="font-helvetica text-xs text-primary-dark/40">
                            · Artikel: <span className="font-bold text-primary-dark">{article?.title}</span>
                            {' '}oleh @{author.username}
                          </span>
                        )}
                      </div>
                      <p className="font-helvetica text-sm text-primary-dark/80 leading-relaxed mb-3">
                        &ldquo;{report.reason}&rdquo;
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        {article && (
                          <Link
                            href={`/opinions/${author?.username}/${article.slug}`}
                            target="_blank"
                            className="font-helvetica text-xs text-accent-blue hover:opacity-70 transition-opacity duration-150"
                          >
                            Buka artikel ↗
                          </Link>
                        )}
                        {article && (
                          <button
                            onClick={() => hideArticle(article.id)}
                            disabled={actionLoading === article.id || article.status === 'hidden'}
                            className="font-helvetica text-xs text-accent-red hover:opacity-70 disabled:opacity-40 transition-opacity duration-150"
                          >
                            {article.status === 'hidden' ? 'Sudah disembunyikan' : 'Sembunyikan artikel'}
                          </button>
                        )}
                        <button
                          onClick={() => markReviewed(report.id)}
                          disabled={actionLoading === report.id}
                          className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark disabled:opacity-40 transition-colors duration-150"
                        >
                          {actionLoading === report.id ? 'Memproses...' : 'Tandai reviewed'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Semua artikel opinions */}
      <section>
        <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-5">
          Semua Artikel Opinions ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <div className="border border-primary-dark/10 py-12 text-center">
            <p className="font-helvetica text-sm text-primary-dark/40">
              Belum ada artikel opinions yang diterbitkan.
            </p>
          </div>
        ) : (
          <div className="border border-primary-dark/10">
            <div className="grid grid-cols-[1fr_120px_130px_100px] px-5 py-3 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Judul</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Penulis</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Status</span>
              <span />
            </div>

            {articles.map((article) => {
              const author = getProfile(article.user_profiles)
              const isHidden = article.status === 'hidden'

              return (
                <div
                  key={article.id}
                  className="grid grid-cols-[1fr_120px_130px_100px] px-5 py-4 border-b border-primary-dark/10 last:border-b-0 items-center hover:bg-primary-dark/[0.015] transition-colors duration-100"
                >
                  <span className={`font-libre text-sm font-bold leading-snug pr-3 truncate ${isHidden ? 'text-primary-dark/40 line-through' : 'text-primary-dark'}`}>
                    {article.title}
                  </span>

                  <span className="font-helvetica text-xs text-primary-dark/60 truncate">
                    {author ? `@${author.username}` : '—'}
                  </span>

                  <span className={`text-center font-helvetica text-xs px-2 py-1 ${
                    isHidden
                      ? 'text-accent-red bg-accent-red/10'
                      : 'text-accent-green bg-accent-green/10'
                  }`}>
                    {isHidden ? 'Disembunyikan' : 'Diterbitkan'}
                  </span>

                  <div className="flex items-center gap-3 justify-end">
                    {!isHidden && author && (
                      <Link
                        href={`/opinions/${author.username}/${article.slug}`}
                        target="_blank"
                        className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150"
                      >
                        ↗
                      </Link>
                    )}
                    <button
                      onClick={() => isHidden ? restoreArticle(article.id) : hideArticle(article.id)}
                      disabled={actionLoading === article.id}
                      className={`font-helvetica text-xs disabled:opacity-40 transition-opacity duration-150 ${
                        isHidden ? 'text-accent-green hover:opacity-70' : 'text-accent-red hover:opacity-70'
                      }`}
                    >
                      {actionLoading === article.id
                        ? '...'
                        : isHidden ? 'Restore' : 'Sembunyikan'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
