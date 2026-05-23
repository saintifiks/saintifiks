'use client'

// Dashboard analitik per penulis — tren views 7 hari + statistik per artikel

import { useState, useEffect } from 'react'
import { BarChart2, Eye, Heart, TrendingUp } from 'lucide-react'

type DailyView = {
  date: string
  count: number
}

type ArticleStat = {
  id: string
  title: string
  views: number
  likes: number
  avg_scroll_depth: number
}

type AnalyticsSummary = {
  daily_views: DailyView[]
  article_stats: ArticleStat[]
}

function formatTanggalPendek(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function OpinionAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/opinions/analytics/summary', { cache: 'no-store' })
        if (!res.ok) throw new Error('Gagal mengambil data analitik')
        const json = await res.json()
        setData(json)
      } catch {
        setError('Gagal memuat analitik. Coba refresh halaman.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-primary-dark/5 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-accent-red/20 bg-accent-red/5 px-5 py-4">
        <p className="font-helvetica text-sm text-accent-red">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const totalViews = data.daily_views.reduce((sum, d) => sum + d.count, 0)
  const totalLikes = data.article_stats.reduce((sum, a) => sum + a.likes, 0)
  const maxDailyViews = Math.max(...data.daily_views.map((d) => d.count), 1)

  return (
    <div className="space-y-8">

      {/* Ringkasan metrik */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-primary-dark/10 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} className="text-primary-dark/40" />
            <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Views 7 hari
            </span>
          </div>
          <p className="font-libre text-2xl font-bold text-primary-dark">
            {totalViews.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="border border-primary-dark/10 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={14} className="text-primary-dark/40" />
            <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Total Suka
            </span>
          </div>
          <p className="font-libre text-2xl font-bold text-primary-dark">
            {totalLikes.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="border border-primary-dark/10 px-5 py-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={14} className="text-primary-dark/40" />
            <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
              Artikel
            </span>
          </div>
          <p className="font-libre text-2xl font-bold text-primary-dark">
            {data.article_stats.length}
          </p>
        </div>
      </div>

      {/* Grafik bar views 7 hari — pure CSS, tanpa library */}
      <div>
        <h3 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-4">
          Views per hari (7 hari terakhir)
        </h3>
        <div className="flex items-end gap-2 h-32 border-b border-primary-dark/10 pb-1">
          {data.daily_views.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="font-helvetica text-xs text-primary-dark/40">
                {day.count > 0 ? day.count : ''}
              </span>
              <div
                className="w-full bg-accent-blue/70 rounded-t transition-all duration-300"
                style={{
                  height: `${Math.max(2, (day.count / maxDailyViews) * 88)}px`,
                  minHeight: '2px',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-1.5">
          {data.daily_views.map((day) => (
            <div key={day.date} className="flex-1 text-center">
              <span className="font-helvetica text-xs text-primary-dark/30">
                {formatTanggalPendek(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel per artikel */}
      {data.article_stats.length > 0 && (
        <div>
          <h3 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-4">
            Per artikel
          </h3>
          <div className="border border-primary-dark/10">
            <div className="grid grid-cols-[1fr_80px_80px_100px] px-4 py-2.5 border-b border-primary-dark/10 bg-primary-dark/[0.03]">
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">Artikel</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Views</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-center">Suka</span>
              <span className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest text-right">
                <TrendingUp size={11} className="inline mr-1" />
                Selesai baca
              </span>
            </div>
            {data.article_stats.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_80px_80px_100px] px-4 py-3 border-b border-primary-dark/10 last:border-b-0 items-center"
              >
                <span className="font-libre text-sm text-primary-dark leading-snug pr-3 truncate">
                  {a.title}
                </span>
                <span className="font-helvetica text-sm text-primary-dark/70 text-center">
                  {a.views.toLocaleString('id-ID')}
                </span>
                <span className="font-helvetica text-sm text-primary-dark/70 text-center">
                  {a.likes.toLocaleString('id-ID')}
                </span>
                <span className="font-helvetica text-sm text-primary-dark/70 text-right">
                  {a.avg_scroll_depth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
