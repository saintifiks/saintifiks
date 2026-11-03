'use client'

// OpinionEditor — editor tulisan Argumen. Alurnya satu garis: tulis → simpan draf → terbitkan → (opsional) tarik ke draf.
//  • Status selalu terlihat di bilah atas (Draf / Terbit / Disembunyikan) beserta keadaan simpan.
//  • Terbit langsung tampil di Argumen tanpa penyuntingan redaksi, jadi tombol Terbitkan meminta konfirmasi
//    yang menjelaskan akibatnya.
//  • Tulisan yang disembunyikan moderator dijelaskan di atas kolom tulis, bukan hanya ditandai.
//  • Perubahan yang belum disimpan dijaga: peringatan saat menutup tab atau kembali ke Akun.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Badge, Button, Sheet, useToast } from '@/components/ui'
import UiLink from '@/components/ui/Link'
import TipTapEditor, { type TipTapEditorHandle } from './TipTapEditor'
import TableWizard from './TableWizard'
import ImageModal from './ImageModal'
import ChartWizard from './ChartWizard'
import CoverImageUpload from './CoverImageUpload'

type ChartConfig = {
  chart_id: string
  config: object
}

type Status = 'draft' | 'published' | 'hidden'

type OpinionEditorProps = {
  mode: 'create' | 'edit'
  articleId?: string
  authorUsername?: string
  initialTitle?: string
  initialContent?: string
  initialExcerpt?: string
  initialCoverImageUrl?: string
  initialStatus?: Status
  initialCharts?: ChartConfig[]
  slugLocked?: boolean
}

const statusBadge = { draft: 'default', published: 'success', hidden: 'danger' } as const
const statusLabel = { draft: 'Draf', published: 'Terbit', hidden: 'Disembunyikan' } as const

const MIN_CONTENT = 100
const MAX_CONTENT = 50000

export default function OpinionEditor({
  mode,
  articleId,
  authorUsername,
  initialTitle = '',
  initialContent = '',
  initialExcerpt = '',
  initialCoverImageUrl = '',
  initialStatus = 'draft',
  initialCharts = [],
  slugLocked = false,
}: OpinionEditorProps) {
  const router = useRouter()
  const toast = useToast()

  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl)
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts)
  const [status, setStatus] = useState<Status>(initialStatus)

  // Isi terakhir yang sudah tersimpan di server; selisihnya = "belum disimpan".
  const [saved, setSaved] = useState({
    title: initialTitle,
    content: initialContent,
    excerpt: initialExcerpt,
    cover: initialCoverImageUrl,
    charts: initialCharts.length,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [showTableWizard, setShowTableWizard] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showChartWizard, setShowChartWizard] = useState(false)

  const editorRef = useRef<TipTapEditorHandle>(null)

  const dirty =
    title !== saved.title ||
    content !== saved.content ||
    excerpt !== saved.excerpt ||
    coverImageUrl !== saved.cover ||
    charts.length !== saved.charts

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // Saat ChartWizard selesai — simpan config chart ke state lokal.
  // Insert placeholder ke TipTap dilakukan lewat window event 'tiptap:insert-chart' di ChartWizard.
  function handleChartInsert(chartId: string, config: object) {
    setCharts((prev) => [...prev, { chart_id: chartId, config }])
  }

  // Teks Markdown dari TableWizard/ImageModal dikirim langsung ke TipTap lewat ref.
  function handleToolbarInsert(text: string) {
    if (editorRef.current) {
      editorRef.current.insertMarkdown(text)
    } else {
      setContent((prev) => prev + text)
    }
  }

  function fail(message: string) {
    toast({ message, tone: 'danger' })
  }

  async function saveArticle(): Promise<{ id: string; slug: string | null } | null> {
    if (!title.trim()) {
      fail('Judul wajib diisi sebelum menyimpan.')
      return null
    }

    setIsSaving(true)
    try {
      const creating = mode === 'create' || !articleId
      const res = await fetch(creating ? '/api/opinions' : `/api/opinions/${articleId}`, {
        method: creating ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, excerpt, cover_image_url: coverImageUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        fail(data.error || 'Gagal menyimpan. Coba lagi.')
        return null
      }

      const id = data.article.id as string

      // Sinkronkan konfigurasi grafik ke DB. Galat duplikat diabaikan: grafik itu sudah ada.
      for (const chart of charts) {
        await fetch('/api/opinion-charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opinion_article_id: id, chart_id: chart.chart_id, config: chart.config }),
        })
      }

      setSaved({ title, content, excerpt, cover: coverImageUrl, charts: charts.length })
      return { id, slug: (data.article.slug as string | undefined) ?? null }
    } catch {
      fail('Terjadi gangguan saat menyimpan. Coba lagi.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSave() {
    const result = await saveArticle()
    if (!result) return
    if (mode === 'create') {
      router.replace(`/akun/artikel/${result.id}/edit`)
      return
    }
    toast({
      message: status === 'published' ? 'Perubahan sudah tampil di tulisan yang terbit.' : 'Draf tersimpan.',
      tone: 'success',
      label: 'Tersimpan',
    })
  }

  async function handlePublish() {
    setConfirmOpen(false)
    const result = await saveArticle()
    if (!result) return

    setIsPublishing(true)
    try {
      const res = await fetch(`/api/opinions/${result.id}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        fail(data.error || 'Gagal menerbitkan. Coba lagi.')
        return
      }
      setStatus('published')
      const slug = (data.article?.slug as string | undefined) ?? result.slug
      toast({
        message: 'Tulisan Anda sudah tampil di Argumen.',
        tone: 'success',
        label: 'Terbit',
        duration: 9000,
        action: authorUsername && slug ? { label: 'Lihat', href: `/argumen/${authorUsername}/${slug}` } : undefined,
      })
      if (mode === 'create') router.replace(`/akun/artikel/${result.id}/edit`)
    } catch {
      fail('Terjadi gangguan saat menerbitkan. Coba lagi.')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleUnpublish() {
    if (!articleId) return
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/opinions/${articleId}/publish`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        fail(data.error || 'Gagal mengubah status. Coba lagi.')
        return
      }
      setStatus('draft')
      toast({ message: 'Tulisan tidak lagi tampil di Argumen. Anda bisa menerbitkannya lagi kapan saja.', label: 'Jadi draf' })
    } catch {
      fail('Terjadi gangguan. Coba lagi.')
    } finally {
      setIsPublishing(false)
    }
  }

  function leave(e: React.MouseEvent) {
    if (dirty && !window.confirm('Perubahan belum disimpan. Tetap keluar?')) e.preventDefault()
  }

  const isBusy = isSaving || isPublishing
  const tooShort = content.trim().length < MIN_CONTENT
  const canPublish = !isBusy && !!title.trim() && !tooShort

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Bilah atas: tinggi tetap 56px karena toolbar TipTap menempel tepat di bawahnya (top-14). */}
      <div className="sticky top-0 z-30 h-14 border-b border-border-default/20 bg-paper">
        <div className="mx-auto flex h-full max-w-[760px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <NextLink
              href="/akun"
              onClick={leave}
              className="font-interface text-sm text-text-secondary underline decoration-border-default/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:text-text-primary hover:decoration-text-primary"
            >
              Akun
            </NextLink>
            <Badge variant={statusBadge[status]}>{statusLabel[status]}</Badge>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span aria-live="polite" className="hidden font-mono text-caption text-text-tertiary sm:inline">
              {isSaving ? 'Menyimpan' : dirty ? 'Belum disimpan' : mode === 'edit' ? 'Tersimpan' : ''}
            </span>
            <Button variant="text" size="sm" onClick={handleSave} disabled={isBusy || (!dirty && mode === 'edit')}>
              {status === 'published' ? 'Simpan perubahan' : 'Simpan draf'}
            </Button>
            {status === 'published' ? (
              <Button variant="danger" size="sm" onClick={handleUnpublish} disabled={isBusy}>
                Tarik ke draf
              </Button>
            ) : status === 'draft' ? (
              <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={!canPublish}>
                Terbitkan
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col">
        {status === 'hidden' && (
          <div role="status" className="mx-4 mt-6 border-l border-signal-danger pl-4 sm:mx-6">
            <p className="font-interface text-sm font-semibold text-text-primary">Tulisan ini disembunyikan moderator.</p>
            <p className="mt-1 font-display text-body-sm leading-relaxed text-text-secondary">
              Tulisan tidak tampil di Argumen setelah ditinjau karena laporan. Anda masih bisa menyimpan perubahan, tetapi
              hanya moderator yang dapat menayangkannya kembali.{' '}
              <UiLink href="/kontak" variant="default">
                Hubungi kami
              </UiLink>{' '}
              bila Anda ingin mengajukan peninjauan ulang.
            </p>
          </div>
        )}

        {/* Metadata tulisan */}
        <div className="space-y-5 border-b border-border-default/20 px-4 pb-6 pt-8 sm:px-6">
          <CoverImageUpload currentUrl={coverImageUrl} onChange={setCoverImageUrl} />

          <label className="block">
            <span className="sr-only">Judul</span>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul tulisan"
              rows={1}
              maxLength={200}
              className="w-full resize-none bg-transparent [field-sizing:content] pb-1.5 font-display text-display-sm leading-[1.15] text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="sr-only">Ringkasan</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan satu-dua kalimat (tampil di daftar Argumen)"
              rows={1}
              maxLength={300}
              className="w-full resize-none bg-transparent [field-sizing:content] font-display text-body-base italic leading-relaxed text-text-secondary placeholder:text-text-tertiary focus:outline-none"
            />
          </label>

          {slugLocked && (
            <p className="font-mono text-caption text-text-tertiary">
              Alamat tulisan sudah terkunci; mengubah judul tidak mengubah alamat.
            </p>
          )}
        </div>

        <TipTapEditor
          ref={editorRef}
          initialContent={content}
          onChange={setContent}
          onOpenTableWizard={() => setShowTableWizard(true)}
          onOpenImageModal={() => setShowImageModal(true)}
          onOpenChartWizard={() => setShowChartWizard(true)}
        />

        <div className="flex items-center justify-between gap-4 border-t border-border-default/20 px-4 py-3 font-mono text-caption sm:px-6">
          <span className={content.length > MAX_CONTENT - 1000 ? 'text-signal-danger' : 'text-text-tertiary'}>
            {content.length.toLocaleString('id-ID')} / {MAX_CONTENT.toLocaleString('id-ID')} karakter
          </span>
          {status === 'draft' && tooShort && (
            <span className="text-text-tertiary">Minimal {MIN_CONTENT} karakter untuk terbit</span>
          )}
        </div>
      </div>

      <Sheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Terbitkan tulisan?">
        <ul className="space-y-4 font-display text-body-sm leading-relaxed text-text-secondary">
          <li>Tulisan langsung tampil di Argumen dan bisa dibaca siapa saja.</li>
          <li>Tulisan terbit tanpa penyuntingan redaksi dan ditandai sebagai pendapat pribadi Anda.</li>
          <li>Pembaca dapat menyukai, berkomentar, mengusulkan koreksi, dan melaporkannya. Moderator dapat menyembunyikannya bila melanggar.</li>
          <li>Alamat tulisan terkunci setelah terbit. Anda tetap bisa mengubah isi dan menariknya kembali menjadi draf.</li>
        </ul>
        <div className="mt-8 flex items-center gap-6">
          <Button onClick={handlePublish} disabled={!canPublish}>
            Terbitkan sekarang
          </Button>
          <Button variant="text" onClick={() => setConfirmOpen(false)}>
            Batal
          </Button>
        </div>
      </Sheet>

      {/* Modals & wizards */}
      {showTableWizard && <TableWizard onInsert={handleToolbarInsert} onClose={() => setShowTableWizard(false)} />}
      {showImageModal && <ImageModal onInsert={handleToolbarInsert} onClose={() => setShowImageModal(false)} />}
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
