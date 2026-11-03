'use client'

// ImageModal — panel sisipkan gambar ke tulisan Argumen. Dua jalan: unggah berkas (disimpan di bucket
// opinions-gambar) atau tempel alamat gambar. Keterangan dan sumber (opsional) menjadi teks alternatif.

import { useId, useRef, useState } from 'react'
import { Button, Field, Input, Sheet } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

type ImageModalProps = {
  onInsert: (markdown: string) => void
  onClose: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export default function ImageModal({ onInsert, onClose }: ImageModalProps) {
  const formId = useId()
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [caption, setCaption] = useState('')
  const [source, setSource] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function buildMarkdown(imageUrl: string): string {
    const altText = [caption.trim(), source.trim()].filter(Boolean).join(' | ')
    return `\n![${altText || 'gambar'}](${imageUrl})\n`
  }

  async function handleFileUpload(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format file harus JPEG, PNG, WebP, atau GIF.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Ukuran file maksimal 5 MB.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Masuk dulu untuk mengunggah gambar.')
        return
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('opinions-gambar')
        .upload(fileName, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        setError('Gagal mengunggah gambar: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('opinions-gambar').getPublicUrl(fileName)
      onInsert(buildMarkdown(publicUrl))
      onClose()
    } catch {
      setError('Terjadi gangguan saat mengunggah. Coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) void handleFileUpload(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFileUpload(file)
    e.target.value = ''
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedUrl = urlInput.trim()
    if (!trimmedUrl) {
      setError('Alamat gambar wajib diisi.')
      return
    }
    onInsert(buildMarkdown(trimmedUrl))
    onClose()
  }

  const tab = (value: 'upload' | 'url', label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => {
        setMode(value)
        setError('')
      }}
      className={[
        'min-h-[44px] border-b px-1 pr-6 font-interface text-caption-lg font-semibold uppercase tracking-widest transition-colors duration-fast',
        mode === value ? 'border-text-primary text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title="Sisipkan gambar"
      footer={
        mode === 'url' ? (
          <div className="flex items-center gap-6">
            <Button type="submit" form={`${formId}-url`}>
              Sisipkan
            </Button>
            <Button variant="text" onClick={onClose}>
              Batal
            </Button>
          </div>
        ) : (
          <Button variant="text" onClick={onClose}>
            Batal
          </Button>
        )
      }
    >
      <div role="tablist" aria-label="Cara menambah gambar" className="flex border-b border-border-default/20">
        {tab('upload', 'Unggah')}
        {tab('url', 'Alamat')}
      </div>

      <div className="mt-8 grid gap-8">
        <Field label="Keterangan" hint="Opsional. Juga dibacakan pembaca layar.">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Sumber" hint="Opsional. Mis. nama fotografer atau lembaga.">
          <Input value={source} onChange={(e) => setSource(e.target.value)} maxLength={200} />
        </Field>

        {mode === 'upload' ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-y border-border-default/20 py-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Berkas gambar"
            />
            <Button variant="text" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? 'Mengunggah' : 'Pilih gambar'}
            </Button>
            <p className="mt-2 font-mono text-caption text-text-tertiary">
              atau seret berkas ke sini · JPEG, PNG, WebP, GIF · maks 5 MB
            </p>
          </div>
        ) : (
          <form id={`${formId}-url`} onSubmit={handleUrlSubmit}>
            <Field label="Alamat gambar" required>
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  setError('')
                }}
                placeholder="https://"
              />
            </Field>
          </form>
        )}

        {error && (
          <p role="alert" className="border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  )
}
