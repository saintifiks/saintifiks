'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type StudioImageUploadProps = {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  description?: string
  previewAlt?: string
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export default function StudioImageUpload({
  label,
  value,
  onChange,
  description = 'JPG, PNG, WebP, atau GIF. Maksimal 5 MB.',
  previewAlt = '',
}: StudioImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!objectUrlRef.current) setPreviewUrl(value)
  }, [value])

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  function clearObjectUrl() {
    if (!objectUrlRef.current) return
    URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
  }

  async function upload(file: File) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError('Format gambar harus JPG, PNG, WebP, atau GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran gambar melebihi 5 MB.')
      return
    }

    clearObjectUrl()
    objectUrlRef.current = URL.createObjectURL(file)
    setPreviewUrl(objectUrlRef.current)
    setUploading(true)
    setError(null)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const objectName = `${crypto.randomUUID()}.${extension}`
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('artikel-gambar')
        .upload(objectName, file, { cacheControl: '31536000', upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('artikel-gambar').getPublicUrl(objectName)
      clearObjectUrl()
      setPreviewUrl(data.publicUrl)
      onChange(data.publicUrl)
    } catch (uploadError) {
      clearObjectUrl()
      setPreviewUrl(value)
      setError(uploadError instanceof Error ? uploadError.message : 'Gambar belum dapat diunggah.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeImage() {
    clearObjectUrl()
    setPreviewUrl(null)
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-interface text-xs font-semibold text-text-primary">{label}</p>
          <p className="mt-1 font-interface text-[11px] leading-relaxed text-text-tertiary">{description}</p>
        </div>
        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={removeImage}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}
          >
            <Trash2 aria-hidden="true" size={14} /> Hapus
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={`relative mt-3 flex min-h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-default/30 bg-surface-sunken/45 text-center hover:border-border-accent hover:bg-signal-info-surface/35 disabled:cursor-wait ${focusRing}`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={previewAlt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <span className={`relative z-base flex flex-col items-center px-5 py-7 ${previewUrl ? 'rounded-lg bg-surface-elevated/90 shadow-sm' : ''}`}>
          {uploading
            ? <LoaderCircle aria-hidden="true" className="animate-spin text-interactive-primary" size={24} />
            : <ImagePlus aria-hidden="true" className="text-text-tertiary" size={24} />}
          <span className="mt-2 font-interface text-xs font-semibold text-text-primary">
            {uploading ? 'Mengunggah gambar...' : previewUrl ? 'Ganti gambar' : 'Pilih gambar'}
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      {error && <p role="alert" className="mt-2 font-interface text-xs text-signal-danger">{error}</p>}
    </div>
  )
}
