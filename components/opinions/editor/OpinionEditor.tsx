'use client'

// Komponen utama editor artikel opinions
// Split panel: textarea (kiri/atas) + live preview (kanan/bawah)
// Mobile: tab switch antara Editor dan Preview

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TipTapEditor, { type TipTapEditorHandle } from './TipTapEditor'
import TableWizard from './TableWizard'
import ImageModal from './ImageModal'
import ChartWizard from './ChartWizard'

type ChartConfig = {
  chart_id: string
  config: object
}

type OpinionEditorProps = {
  mode: 'create' | 'edit'
  articleId?: string
  initialTitle?: string
  initialContent?: string
  initialExcerpt?: string
  initialCoverImageUrl?: string
  initialStatus?: 'draft' | 'published' | 'hidden'
  initialCharts?: ChartConfig[]
  slugLocked?: boolean
}

export default function OpinionEditor({
  mode,
  articleId,
  initialTitle = '',
  initialContent = '',
  initialExcerpt = '',
  initialCoverImageUrl = '',
  initialStatus = 'draft',
  initialCharts = [],
  slugLocked = false,
}: OpinionEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl)
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts)
  const [status, setStatus] = useState(initialStatus)

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')

  const [showTableWizard, setShowTableWizard] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showChartWizard, setShowChartWizard] = useState(false)

  const editorRef = useRef<TipTapEditorHandle>(null)

  // Saat ChartWizard selesai — simpan config chart ke state lokal
  // Insert placeholder ke TipTap dilakukan via window event 'tiptap:insert-chart' di ChartWizard
  function handleChartInsert(chartId: string, config: object) {
    setCharts((prev) => [...prev, { chart_id: chartId, config }])
  }

  // Saat TableWizard/ImageModal insert teks Markdown — kirim langsung ke TipTap via ref
  // Ini lebih andal dari append ke state karena TipTap sudah aktif saat wizard dibuka
  function handleToolbarInsert(text: string) {
    if (editorRef.current) {
      editorRef.current.insertMarkdown(text)
    } else {
      setContent((prev) => prev + text)
    }
  }

  async function saveArticle(): Promise<string | null> {
    setError('')
    if (!title.trim()) {
      setError('Judul artikel wajib diisi')
      return null
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      let id = articleId
      let res: Response

      if (mode === 'create' || !id) {
        res = await fetch('/api/opinions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, excerpt, cover_image_url: coverImageUrl }),
        })
      } else {
        res = await fetch(`/api/opinions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, excerpt, cover_image_url: coverImageUrl }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
        return null
      }

      id = data.article.id

      // Sync chart configs ke DB — upsert satu per satu
      for (const chart of charts) {
        await fetch('/api/opinion-charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opinion_article_id: id,
            chart_id: chart.chart_id,
            config: chart.config,
          }),
        })
        // Error diabaikan jika duplicate — chart sudah ada di DB
      }

      setSaveMessage('Tersimpan')
      setTimeout(() => setSaveMessage(''), 2000)
      return id!
    } catch {
      setError('Terjadi kesalahan saat menyimpan')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSave() {
    const id = await saveArticle()
    if (id && mode === 'create') {
      router.replace(`/akun/artikel/${id}/edit`)
    }
  }

  async function handlePublish() {
    // Simpan dulu, baru publish
    const id = await saveArticle()
    if (!id) return

    setIsPublishing(true)
    setError('')
    try {
      const res = await fetch(`/api/opinions/${id}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal mempublish')
        return
      }
      setStatus('published')
      setSaveMessage('Diterbitkan!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch {
      setError('Terjadi kesalahan saat mempublish')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleUnpublish() {
    if (!articleId) return
    setIsPublishing(true)
    setError('')
    try {
      const res = await fetch(`/api/opinions/${articleId}/publish`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal mengubah status')
        return
      }
      setStatus('draft')
      setSaveMessage('Dikembalikan ke draft')
      setTimeout(() => setSaveMessage(''), 2500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setIsPublishing(false)
    }
  }

  const isBusy = isSaving || isPublishing

  return (
    <div className="min-h-screen bg-primary-light flex flex-col">

      {/* Header editor */}
      <div className="sticky top-0 z-30 bg-primary-light border-b border-primary-dark/10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Kiri: back + status */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push('/akun')}
              className="font-helvetica text-xs text-primary-dark/40 hover:text-primary-dark transition-colors duration-150 flex-shrink-0"
            >
              ← Kembali
            </button>
            <span className={`font-helvetica text-xs px-2.5 py-1 flex-shrink-0 ${
              status === 'published'
                ? 'bg-accent-green/10 text-accent-green'
                : status === 'hidden'
                ? 'bg-accent-red/10 text-accent-red'
                : 'bg-primary-dark/5 text-primary-dark/40'
            }`}>
              {status === 'published' ? 'Diterbitkan' : status === 'hidden' ? 'Disembunyikan' : 'Draft'}
            </span>
            {slugLocked && (
              <span className="font-helvetica text-xs text-primary-dark/30 hidden sm:inline">
                (slug terkunci)
              </span>
            )}
          </div>

          {/* Kanan: tombol aksi */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {saveMessage && (
              <span className="font-helvetica text-xs text-accent-green hidden sm:inline">
                {saveMessage}
              </span>
            )}
            {error && (
              <span className="font-helvetica text-xs text-accent-red hidden sm:inline max-w-[200px] truncate">
                {error}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isBusy}
              className="font-helvetica text-sm border border-primary-dark/20 px-4 py-1.5 hover:bg-primary-dark hover:text-primary-light transition-all duration-150 disabled:opacity-40"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
            </button>

            {status !== 'hidden' && (
              status === 'published' ? (
                <button
                  onClick={handleUnpublish}
                  disabled={isBusy}
                  className="font-helvetica text-sm border border-accent-red/30 text-accent-red px-4 py-1.5 hover:bg-accent-red hover:text-white transition-all duration-150 disabled:opacity-40"
                >
                  Tarik ke Draft
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={isBusy || !title.trim() || content.trim().length < 100}
                  className="font-helvetica text-sm bg-primary-dark text-primary-light px-4 py-1.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-40"
                  title={content.trim().length < 100 ? 'Konten minimal 100 karakter' : ''}
                >
                  {isPublishing ? 'Mempublish...' : 'Terbitkan'}
                </button>
              )
            )}
          </div>
        </div>

      </div>

      {/* Error mobile */}
      {error && (
        <div className="sm:hidden bg-accent-red/5 border-b border-accent-red/20 px-4 py-2">
          <p className="font-helvetica text-xs text-accent-red">{error}</p>
        </div>
      )}

      {/* Body editor */}
      <div className="flex-1 flex flex-col max-w-screen-xl mx-auto w-full">

        {/* Area editor: metadata + TipTap */}
        <div className="flex-1 flex flex-col">

          {/* Metadata artikel */}
          <div className="px-6 pt-6 pb-4 border-b border-primary-dark/10 space-y-3">
            {/* Judul */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul artikel..."
              rows={2}
              maxLength={200}
              className="w-full font-libre text-2xl font-bold text-primary-dark bg-transparent focus:outline-none resize-none leading-snug placeholder:text-primary-dark/20"
            />

            {/* Expand: excerpt + cover image (lipat/buka) */}
            <details className="group">
              <summary className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest cursor-pointer hover:text-primary-dark transition-colors duration-150 list-none">
                + Metadata opsional (excerpt, gambar cover)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-1.5">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Ringkasan singkat artikel (tampil di listing)"
                    rows={2}
                    maxLength={300}
                    className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/25 focus:outline-none focus:border-primary-dark/40 resize-none"
                  />
                </div>
                <div>
                  <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-1.5">
                    URL Gambar Cover
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/25 focus:outline-none focus:border-primary-dark/40"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* TipTap WYSIWYG Editor — toolbar + area tulis terintegrasi */}
          <TipTapEditor
            ref={editorRef}
            initialContent={content}
            onChange={setContent}
            onOpenTableWizard={() => setShowTableWizard(true)}
            onOpenImageModal={() => setShowImageModal(true)}
            onOpenChartWizard={() => setShowChartWizard(true)}
          />

          {/* Karakter counter */}
          <div className="px-6 py-2 border-t border-primary-dark/10">
            <span className={`font-helvetica text-xs ${content.length > 49000 ? 'text-accent-red' : 'text-primary-dark/30'}`}>
              {content.length.toLocaleString('id-ID')} / 50.000 karakter
            </span>
          </div>
        </div>

      </div>

      {/* Modals & wizards */}
      {showTableWizard && (
        <TableWizard
          onInsert={handleToolbarInsert}
          onClose={() => setShowTableWizard(false)}
        />
      )}
      {showImageModal && (
        <ImageModal
          onInsert={handleToolbarInsert}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showChartWizard && (
        <ChartWizard
          articleId={articleId ?? ''}
          onInsert={handleChartInsert}
          onClose={() => setShowChartWizard(false)}
        />
      )}

    </div>
  )
}
