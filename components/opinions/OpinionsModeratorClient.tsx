'use client'

// OpinionsModeratorClient — aksi moderasi Argumen: sembunyikan, tayangkan kembali, tandai laporan selesai.
// Setiap aksi memberi umpan balik lewat notifikasi (keberhasilan dan kegagalan); menyembunyikan tulisan
// meminta konfirmasi karena langsung menariknya dari pembaca.

import { useState } from 'react'
import Link from 'next/link'
import { Badge, Button, useToast } from '@/components/ui'
import { EmptyState, adminLink, sectionTitle, table } from '@/components/admin/ui'
import { formatTanggalPendek } from '@/lib/format-date'

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

export default function OpinionsModeratorClient({ initialReports, initialArticles }: Props) {
  const toast = useToast()
  const [reports, setReports] = useState(initialReports)
  const [articles, setArticles] = useState(initialArticles)
  const [busy, setBusy] = useState<string | null>(null)

  async function setHidden(articleId: string, title: string, hide: boolean) {
    if (hide && !window.confirm(`Sembunyikan “${title}”? Tulisan langsung hilang dari Argumen.`)) return
    setBusy(articleId)
    try {
      const res = await fetch(`/api/admin/opinions/${articleId}/hide`, { method: hide ? 'POST' : 'DELETE' })
      if (!res.ok) throw new Error(String(res.status))
      const status = hide ? 'hidden' : 'published'
      setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, status } : a)))
      setReports((prev) =>
        prev.map((r) => {
          const a = Array.isArray(r.opinion_articles) ? r.opinion_articles[0] : r.opinion_articles
          return a?.id === articleId && a ? { ...r, opinion_articles: { ...a, status } } : r
        })
      )
      toast({
        message: hide ? 'Tulisan disembunyikan dari Argumen.' : 'Tulisan tayang kembali di Argumen.',
        label: hide ? 'Disembunyikan' : 'Tayang',
      })
    } catch {
      toast({ message: 'Belum berhasil. Coba lagi sebentar lagi.', tone: 'danger' })
    } finally {
      setBusy(null)
    }
  }

  async function markReviewed(reportId: string) {
    setBusy(reportId)
    try {
      const res = await fetch('/api/admin/opinions/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      toast({ message: 'Laporan ditandai selesai ditinjau.', label: 'Selesai' })
    } catch {
      toast({ message: 'Belum berhasil. Coba lagi sebentar lagi.', tone: 'danger' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-16">
      <section aria-labelledby="laporan-heading">
        <h2 id="laporan-heading" className={`mb-4 ${sectionTitle}`}>
          Laporan menunggu · {reports.length}
        </h2>

        {reports.length === 0 ? (
          <EmptyState title="Tidak ada laporan yang menunggu" />
        ) : (
          <ul className="divide-y divide-border-default/20 border-y border-border-default/20">
            {reports.map((report) => {
              const article = Array.isArray(report.opinion_articles) ? report.opinion_articles[0] : report.opinion_articles
              const author = article ? getProfile(article.user_profiles) : null
              const hidden = article?.status === 'hidden'

              return (
                <li key={report.id} className="py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="font-display text-lg text-text-primary">{article?.title ?? 'Tulisan dihapus'}</p>
                    <p className="font-mono text-caption text-text-tertiary">
                      {author ? `@${author.username} · ` : ''}dilaporkan {formatTanggalPendek(report.created_at)}
                    </p>
                  </div>
                  <p className="mt-3 max-w-2xl border-l border-border-default pl-4 font-display text-body-sm italic leading-relaxed text-text-secondary">
                    {report.reason}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {article && author && (
                      <Link
                        href={`/argumen/${author.username}/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-interface text-sm text-text-primary ${adminLink}`}
                      >
                        Buka tulisan
                      </Link>
                    )}
                    {article &&
                      (hidden ? (
                        <span className="font-mono text-caption text-text-tertiary">Sudah disembunyikan</span>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setHidden(article.id, article.title, true)}
                          disabled={busy === article.id}
                        >
                          Sembunyikan tulisan
                        </Button>
                      ))}
                    <Button variant="text" size="sm" onClick={() => markReviewed(report.id)} disabled={busy === report.id}>
                      Tandai selesai
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="semua-heading">
        <h2 id="semua-heading" className={`mb-4 ${sectionTitle}`}>
          Semua tulisan · {articles.length}
        </h2>

        {articles.length === 0 ? (
          <EmptyState title="Belum ada tulisan Argumen yang terbit" />
        ) : (
          <div className={table.wrap}>
            <table className={table.root}>
              <caption className="sr-only">Semua tulisan Argumen</caption>
              <thead>
                <tr className={table.headRow}>
                  <th scope="col" className={table.th}>Judul</th>
                  <th scope="col" className={`${table.th} hidden sm:table-cell`}>Penulis</th>
                  <th scope="col" className={table.th}>Status</th>
                  <th scope="col" className={table.th}><span className="sr-only">Tindakan</span></th>
                </tr>
              </thead>
              <tbody className={table.bodyRows}>
                {articles.map((article) => {
                  const author = getProfile(article.user_profiles)
                  const hidden = article.status === 'hidden'
                  return (
                    <tr key={article.id}>
                      <th scope="row" className={`${table.td} font-normal`}>
                        <p className={`font-display text-base ${hidden ? 'text-text-tertiary line-through decoration-1' : 'text-text-primary'}`}>
                          {article.title}
                        </p>
                        {!hidden && author && (
                          <Link
                            href={`/argumen/${author.username}/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-1 inline-block font-mono text-caption text-text-tertiary ${adminLink}`}
                          >
                            Buka
                          </Link>
                        )}
                      </th>
                      <td className={`${table.td} hidden font-mono text-caption text-text-secondary sm:table-cell`}>
                        {author ? `@${author.username}` : '—'}
                      </td>
                      <td className={table.td}>
                        <Badge variant={hidden ? 'danger' : 'success'}>{hidden ? 'Disembunyikan' : 'Tayang'}</Badge>
                      </td>
                      <td className={`${table.td} text-right`}>
                        <Button
                          variant={hidden ? 'text' : 'danger'}
                          size="sm"
                          onClick={() => setHidden(article.id, article.title, !hidden)}
                          disabled={busy === article.id}
                        >
                          {hidden ? 'Tayangkan' : 'Sembunyikan'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
