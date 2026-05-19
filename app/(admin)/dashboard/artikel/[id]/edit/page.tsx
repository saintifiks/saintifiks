'use client'

// Halaman form edit artikel — hanya bisa diakses pemilik (dilindungi auth guard di layout.tsx)
// Client Component karena butuh state form + fetch data artikel dari database saat halaman dibuka
// Pola: fetch on mount via useEffect → pre-fill semua field → user edit → simpan/terbitkan

import { useEffect, useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  updateArtikel,
  terbitkanArtikel,
  jadikanDraft,
} from '@/app/(admin)/dashboard/artikel/actions'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

// Auto-generate slug di sisi client
// Fungsi ini identik dengan yang ada di baru/page.tsx dan actions.ts
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

export default function EditArtikelPage() {
  const params = useParams()
  const id = params.id as string

  // State data dari database
  const [loading, setLoading] = useState(true)
  const [tidakDitemukan, setTidakDitemukan] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [slugLive, setSlugLive] = useState('') // slug artikel yang sudah live (untuk link pratinjau)

  // State form
  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDiubahManual, setSlugDiubahManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [konten, setKonten] = useState('')

  // State UI
  const [error, setError] = useState<string | null>(null)
  const [pesanSukses, setPesanSukses] = useState<string | null>(null)
  const [mode, setMode] = useState<'tulis' | 'preview'>('tulis')
  const [isPending, startTransition] = useTransition()

  // Ambil data artikel dari Supabase saat halaman pertama kali dibuka
  useEffect(() => {
    async function ambilArtikel() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, content, excerpt, is_published, published_at')
        .eq('id', id)
        .single()

      if (error || !data) {
        setTidakDitemukan(true)
        setLoading(false)
        return
      }

      // Pre-fill semua field dengan data dari database
      setJudul(data.title)
      setSlug(data.slug)
      setSlugLive(data.slug)
      setExcerpt(data.excerpt ?? '')
      setKonten(data.content)
      setIsPublished(data.is_published)
      setLoading(false)
    }

    ambilArtikel()
  }, [id])

  // Handler: judul berubah → auto-update slug jika belum diubah manual
  function handleJudulChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nilaiJudul = e.target.value
    setJudul(nilaiJudul)
    if (!slugDiubahManual) {
      setSlug(buatSlug(nilaiJudul))
    }
  }

  // Handler: slug diubah manual → tandai agar auto-generate berhenti
  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugDiubahManual(true)
  }

  // Simpan perubahan — tidak mengubah status published/draft
  function handleSimpan() {
    setError(null)
    setPesanSukses(null)
    startTransition(async () => {
      const hasil = await updateArtikel(id, {
        title: judul,
        slug,
        content: konten,
        excerpt,
      })
      if (hasil && 'error' in hasil) {
        setError(hasil.error)
      } else {
        setPesanSukses('Perubahan berhasil disimpan.')
        setSlugLive(slug) // perbarui slug live setelah disimpan
      }
    })
  }

  // Simpan lalu terbitkan — dua langkah berurutan
  function handleTerbitkan() {
    setError(null)
    setPesanSukses(null)
    startTransition(async () => {
      // Langkah 1: simpan perubahan terbaru terlebih dahulu
      const hasilUpdate = await updateArtikel(id, {
        title: judul,
        slug,
        content: konten,
        excerpt,
      })
      if (hasilUpdate && 'error' in hasilUpdate) {
        setError(hasilUpdate.error)
        return
      }

      // Langkah 2: ubah status jadi published → Server Action redirect ke /dashboard
      const hasilTerbitkan = await terbitkanArtikel(id)
      if (hasilTerbitkan && 'error' in hasilTerbitkan) {
        setError(hasilTerbitkan.error)
      }
    })
  }

  // Tarik kembali artikel yang sudah live menjadi draft
  function handleJadikanDraft() {
    setError(null)
    setPesanSukses(null)
    startTransition(async () => {
      const hasil = await jadikanDraft(id)
      if (hasil && 'error' in hasil) {
        setError(hasil.error)
      } else {
        setIsPublished(false)
        setPesanSukses('Artikel berhasil dijadikan draft.')
      }
    })
  }

  // ── Tampilan loading ──
  if (loading) {
    return (
      <main className="min-h-screen bg-primary-light flex items-center justify-center">
        <p className="font-helvetica text-sm text-primary-dark/40">Memuat artikel...</p>
      </main>
    )
  }

  // ── Tampilan artikel tidak ditemukan ──
  if (tidakDitemukan) {
    return (
      <main className="min-h-screen bg-primary-light flex items-center justify-center">
        <div className="text-center">
          <p className="font-helvetica text-sm text-primary-dark/60 mb-4">
            Artikel tidak ditemukan.
          </p>
          <Link
            href="/dashboard"
            className="font-helvetica text-sm text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    )
  }

  // ── Tampilan utama form edit ──
  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Header halaman ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest hover:text-primary-dark transition-colors duration-150"
            >
              ← Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-3">
              <h1 className="font-libre text-2xl font-bold text-primary-dark">
                Edit Artikel
              </h1>
              {/* Badge status — menunjukkan apakah artikel sudah live atau masih draft */}
              <span className={`font-helvetica text-xs px-3 py-1 ${
                isPublished
                  ? 'bg-primary-dark text-primary-light'
                  : 'bg-primary-dark/10 text-primary-dark/50'
              }`}>
                {isPublished ? 'Diterbitkan' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Tombol aksi — kanan atas */}
          <div className="flex items-center gap-4 mt-2">

            {/* Toggle Tulis / Preview */}
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

            {/* Tombol Jadikan Draft — hanya muncul jika artikel sudah diterbitkan */}
            {isPublished && (
              <button
                onClick={handleJadikanDraft}
                disabled={isPending}
                className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 underline underline-offset-2 disabled:opacity-40"
              >
                Jadikan Draft
              </button>
            )}

            {/* Tombol Simpan Perubahan — selalu ada */}
            <button
              onClick={handleSimpan}
              disabled={isPending}
              className="font-helvetica text-sm border border-primary-dark text-primary-dark px-5 py-2.5 hover:bg-primary-dark hover:text-primary-light transition-colors duration-150 disabled:opacity-40"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>

            {/* Tombol Terbitkan — hanya muncul jika masih draft */}
            {!isPublished && (
              <button
                onClick={handleTerbitkan}
                disabled={isPending}
                className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
              >
                {isPending ? 'Memproses...' : 'Terbitkan'}
              </button>
            )}

          </div>
        </div>

        {/* ── Pesan error ── */}
        {error && (
          <div className="mb-6 p-4 border border-accent-red/40 bg-accent-red/5">
            <p className="font-helvetica text-sm text-accent-red">{error}</p>
          </div>
        )}

        {/* ── Pesan sukses ── */}
        {pesanSukses && (
          <div className="mb-6 p-4 border border-primary-dark/15 bg-primary-dark/5">
            <p className="font-helvetica text-sm text-primary-dark/70">{pesanSukses}</p>
          </div>
        )}

        {/* ── Metadata artikel ── */}
        <div className="space-y-6 mb-8 pb-8 border-b border-primary-dark/10">

          {/* Judul */}
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

          {/* Slug */}
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
              Slug
              {isPublished && (
                <span className="ml-2 normal-case font-normal text-accent-red/70">
                  (hati-hati mengubah slug artikel yang sudah live — URL lama akan error)
                </span>
              )}
              {!isPublished && (
                <span className="ml-2 normal-case font-normal text-primary-dark/30">
                  (URL artikel — bisa diubah)
                </span>
              )}
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

          {/* Excerpt / Ringkasan */}
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

        </div>

        {/* ── Area konten: Tulis atau Preview ── */}
        <div className="border border-primary-dark/10">

          {mode === 'tulis' ? (

            /* Mode Tulis: textarea untuk edit Markdown */
            <textarea
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Isi artikel dalam format Markdown..."
              className="w-full h-[55vh] font-mono text-sm text-primary-dark bg-primary-light p-6 focus:outline-none resize-none placeholder-primary-dark/20 leading-relaxed"
            />

          ) : (

            /* Mode Preview: render Markdown identik dengan tampilan artikel live */
            <div className="min-h-[55vh] p-8 bg-primary-light">
              {konten ? (
                <article>
                  {judul && (
                    <h1 className="font-libre text-4xl font-bold text-primary-dark mb-6 leading-tight">
                      {judul}
                    </h1>
                  )}
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-libre text-3xl font-bold text-primary-dark mt-10 mb-4 leading-tight">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-libre text-2xl font-bold text-primary-dark mt-8 mb-3 leading-tight">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-libre text-xl font-bold text-primary-dark mt-6 mb-2 leading-tight">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="font-libre text-lg text-primary-dark leading-relaxed mb-5">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-primary-dark">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      ul: ({ children }) => (
                        <ul className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-disc">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-decimal">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary-dark/20 pl-6 my-6 font-libre text-lg text-primary-dark/70 italic">{children}</blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
                          target={href?.startsWith('http') ? '_blank' : undefined}
                          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className="font-mono text-sm bg-primary-dark/5 text-primary-dark px-1.5 py-0.5 rounded">{children}</code>
                      ),
                      hr: () => (
                        <hr className="border-primary-dark/10 my-10" />
                      ),
                    }}
                  >
                    {konten}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="font-helvetica text-sm text-primary-dark/30">
                  Belum ada konten untuk di-preview. Ketik dulu di tab &quot;Tulis&quot;.
                </p>
              )}
            </div>

          )}
        </div>

        {/* Link ke artikel live — hanya muncul jika sudah diterbitkan */}
        {isPublished && (
          <p className="font-helvetica text-xs text-primary-dark/30 mt-4">
            Artikel ini live di:{' '}
            <a
              href={`/artikel/${slugLive}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:opacity-70 transition-opacity duration-150"
            >
              /artikel/{slugLive} ↗
            </a>
          </p>
        )}

      </div>
    </main>
  )
}
