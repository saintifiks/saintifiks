'use client'

import { useState, useTransition, useEffect } from 'react'
import { buatArtikelBaru } from '@/app/(admin)/dashboard/artikel/actions'
import Link from 'next/link'
import ArticleRenderer from '@/components/artikel/ArticleRenderer'
import ImageUpload from '@/components/artikel/ImageUpload'

function buatSlug(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[àáâäãåā]/g, 'a')
    .replace(/[èéêëē]/g, 'e')
    .replace(/[ìíîïī]/g, 'i')
    .replace(/[òóôöõøō]/g, 'o')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function ArtikelBaruPage() {
  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDiubahManual, setSlugDiubahManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [konten, setKonten] = useState('')

  const [charts, setCharts] = useState<{ identifier: string; config: string }[]>([])

  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'tulis' | 'preview'>('tulis')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const matches = Array.from(konten.matchAll(/{{chart:([^}]+)}}/g))
    const foundIdentifiers = matches.map(m => m[1])

    setCharts(prev => {
      return foundIdentifiers.map(id => {
        const existing = prev.find(p => p.identifier === id)
        return existing ? existing : { identifier: id, config: '' }
      })
    })
  }, [konten])

  function handleJudulChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nilaiJudul = e.target.value
    setJudul(nilaiJudul)
    if (!slugDiubahManual) {
      setSlug(buatSlug(nilaiJudul))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugDiubahManual(true)
  }

  function handleSimpanDraft() {
    setError(null)
    startTransition(async () => {
      const hasil = await buatArtikelBaru({
        title: judul,
        slug,
        content: konten,
        excerpt,
        cover_image_url: coverImageUrl || null,
        charts,
      })
      if (hasil && 'error' in hasil) {
        setError(hasil.error)
      }
    })
  }

  const previewCharts = charts.map(c => ({
    chart_identifier: c.identifier,
    config: c.config
  }))

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link
               href="/dashboard"
              className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest hover:text-primary-dark transition-colors duration-150"
            >
              ← Dashboard
            </Link>
            <h1 className="font-libre text-2xl font-bold text-primary-dark mt-3">
              Artikel Baru
            </h1>
          </div>

          <div className="flex items-center gap-5 mt-2">
            <div className="flex border border-primary-dark/20">
              <button
                onClick={() => setMode('tulis')}
                className={`font-helvetica text-xs px-4 py-2 transition-colors duration-150 ${
                  mode === 'tulis'
                    ? 'bg-primary-dark text-primary-light'
                    : 'text-primary-dark/50 hover:text-primary-dark'
                }`}
              >
                Tulis
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`font-helvetica text-xs px-4 py-2 transition-colors duration-150 ${
                  mode === 'preview'
                    ? 'bg-primary-dark text-primary-light'
                    : 'text-primary-dark/50 hover:text-primary-dark'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={handleSimpanDraft}
              disabled={isPending}
              className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-accent-red/40 bg-accent-red/5">
            <p className="font-helvetica text-sm text-accent-red">{error}</p>
          </div>
        )}

        <div className="space-y-6 mb-8 pb-8 border-b border-primary-dark/10">
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
              Judul
            </label>
            <input
              type="text"
              value={judul}
              onChange={handleJudulChange}
              placeholder="Judul artikel..."
              className="w-full font-libre text-2xl font-bold text-primary-dark bg-transparent border-b border-primary-dark/15 pb-2 focus:outline-none focus:border-primary-dark transition-colors placeholder-primary-dark/20"
            />
          </div>

          <div>
            <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
              Slug
              <span className="ml-2 normal-case font-normal text-primary-dark/30">
                (URL artikel — dibuat otomatis dari judul, bisa diubah)
              </span>
            </label>
            <div className="flex items-center gap-1">
              <span className="font-helvetica text-sm text-primary-dark/30 shrink-0">/artikel/</span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="slug-artikel"
                className="flex-1 font-helvetica text-sm text-primary-dark bg-transparent border-b border-primary-dark/15 pb-1 focus:outline-none focus:border-primary-dark transition-colors placeholder-primary-dark/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
              Ringkasan
              <span className="ml-2 normal-case font-normal text-primary-dark/30">
                (opsional — muncul di beranda dan hasil Google)
              </span>
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Satu kalimat yang merangkum isi artikel..."
              className="w-full font-helvetica text-sm text-primary-dark bg-transparent border-b border-primary-dark/15 pb-1 focus:outline-none focus:border-primary-dark transition-colors placeholder-primary-dark/20"
            />
          </div>

          <div>
            <ImageUpload 
              currentImageUrl={coverImageUrl || null} 
              onUpload={(url) => setCoverImageUrl(url)} 
            />
          </div>
        </div>

        <div className="border border-primary-dark/10">
          {mode === 'tulis' ? (
            <div>
              <textarea
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                placeholder={`Tulis isi artikel dalam format Markdown...\n\nUntuk memunculkan grafik, ketik: {{chart:nama-grafik}}`}
                className="w-full h-[55vh] font-mono text-sm text-primary-dark bg-primary-light p-6 focus:outline-none resize-none placeholder-primary-dark/20 leading-relaxed"
              />

              {charts.length > 0 && (
                <div className="border-t border-primary-dark/10 bg-primary-dark/[0.02] p-6">
                  <h3 className="font-helvetica text-xs font-bold text-primary-dark mb-4 uppercase tracking-widest">
                    Konfigurasi Chart ({charts.length} Terdeteksi)
                  </h3>
                  {charts.map((chart, index) => (
                    <div key={chart.identifier} className="mb-5 last:mb-0">
                      <label className="block font-helvetica text-sm text-primary-dark/80 mb-2">
                        Paste JSON untuk: <strong className="text-accent-blue font-mono bg-accent-blue/5 px-1">{`{{chart:${chart.identifier}}}`}</strong>
                      </label>
                      <textarea
                        value={chart.config}
                        onChange={(e) => {
                          const newCharts = [...charts]
                          newCharts[index].config = e.target.value
                          setCharts(newCharts)
                        }}
                        placeholder='{"type": "line", "data": {...}, "options": {...}}'
                        className="w-full h-32 font-mono text-xs text-primary-dark bg-white p-3 border border-primary-dark/15 focus:outline-none focus:border-primary-dark transition-colors resize-y"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[55vh] p-8 bg-primary-light">
              {konten ? (
                <article>
                  {judul && (
                    <h1 className="font-libre text-4xl font-bold text-primary-dark mb-6 leading-tight">
                      {judul}
                    </h1>
                  )}
                  {coverImageUrl && (
                    <div className="mb-8 w-full max-h-[500px] overflow-hidden bg-primary-dark/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImageUrl} alt="Cover Artikel" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <ArticleRenderer content={konten} charts={previewCharts} />
                </article>
              ) : (
                <p className="font-helvetica text-sm text-primary-dark/30">
                  Belum ada konten untuk di-preview. Ketik dulu di tab &quot;Tulis&quot;.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="font-helvetica text-xs text-primary-dark/30 mt-4">
          Setelah menyimpan draft, kamu akan kembali ke Dashboard. Klik &quot;Edit&quot; pada artikel untuk menerbitkannya.
        </p>

      </div>
    </main>
  )
}