'use client'

// Halaman form tulis artikel baru — hanya bisa diakses pemilik (dilindungi auth guard di layout.tsx)
// Client Component karena butuh state: judul, slug, konten, mode tampilan, status loading

import { useState, useTransition } from 'react'
import { buatArtikelBaru } from '@/app/(admin)/dashboard/artikel/actions'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

// Auto-generate slug di sisi client saat pengguna mengetik judul
// Contoh: "Inflasi Indonesia 2026" → "inflasi-indonesia-2026"
// Fungsi ini sengaja ditulis di sini (client-side) agar slug langsung muncul saat user mengetik
// tanpa perlu round-trip ke server
function buatSlug(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[àáâäãåā]/g, 'a')
    .replace(/[èéêëē]/g, 'e')
    .replace(/[ìíîïī]/g, 'i')
    .replace(/[òóôöõøō]/g, 'o')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '') // hapus karakter selain huruf, angka, spasi, strip
    .trim()
    .replace(/\s+/g, '-')          // spasi → strip
    .replace(/-+/g, '-')           // strip berulang → satu strip
}

export default function ArtikelBaruPage() {
  // State form
  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDiubahManual, setSlugDiubahManual] = useState(false) // true jika user edit slug sendiri
  const [excerpt, setExcerpt] = useState('')
  const [konten, setKonten] = useState('')

  // State UI
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'tulis' | 'preview'>('tulis')
  const [isPending, startTransition] = useTransition()

  // Handler: saat judul berubah — auto-generate slug jika user belum ubah manual
  function handleJudulChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nilaiJudul = e.target.value
    setJudul(nilaiJudul)
    if (!slugDiubahManual) {
      setSlug(buatSlug(nilaiJudul))
    }
  }

  // Handler: saat slug diubah manual — tandai agar auto-generate tidak override lagi
  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugDiubahManual(true)
  }

  // Handler: tombol Simpan Draft diklik
  function handleSimpanDraft() {
    setError(null)
    startTransition(async () => {
      const hasil = await buatArtikelBaru({
        title: judul,
        slug,
        content: konten,
        excerpt,
      })
      // Jika ada error: tampilkan pesan, tetap di halaman
      if (hasil && 'error' in hasil) {
        setError(hasil.error)
      }
      // Jika berhasil: Server Action otomatis redirect ke /dashboard
    })
  }

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
            <h1 className="font-libre text-2xl font-bold text-primary-dark mt-3">
              Artikel Baru
            </h1>
          </div>

          {/* Tombol aksi — kanan atas */}
          <div className="flex items-center gap-5 mt-2">

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

            {/* Tombol Simpan Draft */}
            <button
              onClick={handleSimpanDraft}
              disabled={isPending}
              className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Draft'}
            </button>

          </div>
        </div>

        {/* ── Kotak error — hanya muncul jika ada error dari Server Action ── */}
        {error && (
          <div className="mb-6 p-4 border border-accent-red/40 bg-accent-red/5">
            <p className="font-helvetica text-sm text-accent-red">{error}</p>
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

            /* Mode Tulis: textarea untuk input Markdown */
            <textarea
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder={`Tulis isi artikel dalam format Markdown...\n\nContoh:\n## Sub-judul\n\nParagraf biasa di sini.\n\n**teks tebal**, *teks miring*\n\n- poin pertama\n- poin kedua`}
              className="w-full h-[55vh] font-mono text-sm text-primary-dark bg-primary-light p-6 focus:outline-none resize-none placeholder-primary-dark/20 leading-relaxed"
            />

          ) : (

            /* Mode Preview: render Markdown sama persis dengan tampilan artikel live */
            <div className="min-h-[55vh] p-8 bg-primary-light">
              {konten ? (
                <article>
                  {/* Judul artikel di preview */}
                  {judul && (
                    <h1 className="font-libre text-4xl font-bold text-primary-dark mb-6 leading-tight">
                      {judul}
                    </h1>
                  )}
                  {/* Render Markdown — komponen identik dengan halaman artikel live */}
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-libre text-3xl font-bold text-primary-dark mt-10 mb-4 leading-tight">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-libre text-2xl font-bold text-primary-dark mt-8 mb-3 leading-tight">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-libre text-xl font-bold text-primary-dark mt-6 mb-2 leading-tight">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="font-libre text-lg text-primary-dark leading-relaxed mb-5">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-primary-dark">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      ul: ({ children }) => (
                        <ul className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-disc">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary-dark/20 pl-6 my-6 font-libre text-lg text-primary-dark/70 italic">
                          {children}
                        </blockquote>
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
                        <code className="font-mono text-sm bg-primary-dark/5 text-primary-dark px-1.5 py-0.5 rounded">
                          {children}
                        </code>
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
                /* Kondisi kosong: belum ada konten untuk di-preview */
                <p className="font-helvetica text-sm text-primary-dark/30">
                  Belum ada konten untuk di-preview. Ketik dulu di tab &quot;Tulis&quot;.
                </p>
              )}
            </div>

          )}
        </div>

        {/* ── Keterangan di bawah area tulis ── */}
        <p className="font-helvetica text-xs text-primary-dark/30 mt-4">
          Setelah menyimpan draft, kamu akan kembali ke Dashboard. Klik &quot;Edit&quot; pada artikel untuk menerbitkannya.
        </p>

      </div>
    </main>
  )
}
