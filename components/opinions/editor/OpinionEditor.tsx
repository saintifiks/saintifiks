'use client'

// OpinionEditor — editor tulisan Argumen. Alat tulisnya persis editor Studio yang dipakai redaksi (StudioEditor):
// menu "/", toolbar mengambang, tabel, gambar berketerangan, kutipan, catatan kaki, persamaan, dan daftar sumber.
// Alurnya satu garis: tulis → simpan draf → terbitkan → (opsional) tarik ke draf.
//  • Status selalu terlihat di bilah atas (Draf / Terbit / Disembunyikan) beserta keadaan simpan.
//  • Terbit langsung tampil di Argumen tanpa penyuntingan redaksi, jadi tombol Terbitkan meminta konfirmasi
//    yang menjelaskan akibatnya.
//  • Tulisan yang disembunyikan moderator dijelaskan di atas kolom tulis, bukan hanya ditandai.
//  • Perubahan yang belum disimpan dijaga: peringatan saat menutup tab atau kembali ke Akun.

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Badge, Button, Sheet, useToast } from '@/components/ui'
import UiLink from '@/components/ui/Link'
import StudioEditor from '@/components/editorial-studio/StudioEditor'
import StudioSourceRegistry from '@/components/editorial-studio/StudioSourceRegistry'
import type { StudioDocumentV2, StudioJsonNode, StudioSourceEvidence } from '@/lib/editorial-studio/document'
import { studioDocumentToMarkdown } from '@/lib/editorial-studio/markdown-adapter'
import { OPINION_MAX_MARKDOWN } from '@/lib/opinions/studio-document'
import CoverImageUpload from './CoverImageUpload'

type Status = 'draft' | 'published' | 'hidden'

type OpinionEditorProps = {
  mode: 'create' | 'edit'
  articleId?: string
  authorUsername?: string
  // Pemilik tulisan: gambar yang diunggah disimpan di folder miliknya (kebijakan bucket opinions-gambar).
  authorUserId?: string
  initialDocument: StudioDocumentV2
  initialTitle?: string
  initialExcerpt?: string
  initialCoverImageUrl?: string
  initialStatus?: Status
  slugLocked?: boolean
}

const statusBadge = { draft: 'default', published: 'success', hidden: 'danger' } as const
const statusLabel = { draft: 'Draf', published: 'Terbit', hidden: 'Disembunyikan' } as const

const MIN_CONTENT = 100

function countWords(node: StudioJsonNode): number {
  if (node.type === 'text') return (node.text ?? '').trim().split(/\s+/).filter(Boolean).length
  return (node.content ?? []).reduce((sum, child) => sum + countWords(child), 0)
}

export default function OpinionEditor({
  mode,
  articleId,
  authorUsername,
  authorUserId,
  initialDocument,
  initialTitle = '',
  initialExcerpt = '',
  initialCoverImageUrl = '',
  initialStatus = 'draft',
  slugLocked = false,
}: OpinionEditorProps) {
  const router = useRouter()
  const toast = useToast()

  const [document, setDocument] = useState(initialDocument)
  const [title, setTitle] = useState(initialTitle)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl)
  const [status, setStatus] = useState<Status>(initialStatus)

  // Isi terakhir yang sudah tersimpan di server; selisihnya = "belum disimpan". Isi tulisan dilacak lewat
  // penanda (bukan membandingkan seluruh dokumen setiap ketikan).
  const [documentEdited, setDocumentEdited] = useState(false)
  const [saved, setSaved] = useState({ title: initialTitle, excerpt: initialExcerpt, cover: initialCoverImageUrl })

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dirty =
    documentEdited || title !== saved.title || excerpt !== saved.excerpt || coverImageUrl !== saved.cover

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const wordCount = useMemo(() => countWords(document.root), [document.root])
  // Panjang Markdown turunan = ukuran yang dinilai server saat menyimpan dan menerbitkan.
  const contentLength = useMemo(() => studioDocumentToMarkdown(document).length, [document])

  function handleDocumentChange(next: StudioDocumentV2) {
    setDocumentEdited(true)
    setDocument(next)
  }

  function handleSourcesChange(sources: StudioSourceEvidence[]) {
    setDocumentEdited(true)
    setDocument((current) => ({ ...current, evidence: { ...current.evidence, sources } }))
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
        body: JSON.stringify({ title, studio_document: document, excerpt, cover_image_url: coverImageUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        fail(data.error || 'Gagal menyimpan. Coba lagi.')
        return null
      }

      setSaved({ title, excerpt, cover: coverImageUrl })
      setDocumentEdited(false)
      return { id: data.article.id as string, slug: (data.article.slug as string | undefined) ?? null }
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
  const tooShort = contentLength < MIN_CONTENT
  const tooLong = contentLength > OPINION_MAX_MARKDOWN
  const canPublish = !isBusy && !!title.trim() && !tooShort && !tooLong

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Bilah atas: tinggi tetap 56px karena toolbar editor menempel tepat di bawahnya (top-14). */}
      <div className="sticky top-0 z-30 h-14 border-b border-border-default/20 bg-paper">
        <div className="mx-auto flex h-full max-w-[900px] items-center justify-between gap-3 px-4 sm:px-6">
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

      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-4 px-0 pb-16 pt-4 sm:px-6">
        {status === 'hidden' && (
          <div role="status" className="mx-4 mt-2 border-l border-signal-danger pl-4 sm:mx-0">
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

        <div className="px-4 sm:px-0">
          <CoverImageUpload currentUrl={coverImageUrl} onChange={setCoverImageUrl} />
          {slugLocked && (
            <p className="mt-3 font-mono text-caption text-text-tertiary">
              Alamat tulisan sudah terkunci; mengubah judul tidak mengubah alamat.
            </p>
          )}
        </div>

        <StudioSourceRegistry document={document} onChange={handleSourcesChange} />
        <StudioEditor
          document={document}
          title={title}
          deck={excerpt}
          wordCount={wordCount}
          sources={document.evidence.sources}
          onChange={handleDocumentChange}
          onTitleChange={setTitle}
          onDeckChange={setExcerpt}
          imageStorage={authorUserId ? { bucket: 'opinions-gambar', folder: authorUserId } : undefined}
          toolbarStickyClass="top-14"
        />

        <div className="flex items-center justify-between gap-4 px-4 font-mono text-caption sm:px-0">
          <span className={tooLong || contentLength > OPINION_MAX_MARKDOWN - 1000 ? 'text-signal-danger' : 'text-text-tertiary'}>
            {contentLength.toLocaleString('id-ID')} / {OPINION_MAX_MARKDOWN.toLocaleString('id-ID')} karakter
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
    </div>
  )
}
