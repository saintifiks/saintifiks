'use client'

// Modal upload gambar untuk editor opinions
// Upload ke Supabase Storage bucket opinions-gambar, kemudian insert Markdown ![caption](url)

import { useState, useRef } from 'react'
import { X, Upload, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ImageModalProps = {
  onInsert: (markdown: string) => void
  onClose: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export default function ImageModal({ onInsert, onClose }: ImageModalProps) {
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
      setError('Format file harus JPEG, PNG, WebP, atau GIF')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Harus login untuk mengupload gambar')
        setIsUploading(false)
        return
      }

      // Generate nama file unik
      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('opinions-gambar')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        setError('Gagal mengupload gambar: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('opinions-gambar')
        .getPublicUrl(fileName)

      onInsert(buildMarkdown(publicUrl))
      onClose()
    } catch {
      setError('Terjadi kesalahan saat upload. Coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedUrl = urlInput.trim()
    if (!trimmedUrl) {
      setError('URL gambar wajib diisi')
      return
    }
    onInsert(buildMarkdown(trimmedUrl))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40">
      <div className="bg-primary-light border border-primary-dark/10 w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-helvetica text-sm font-bold text-primary-dark uppercase tracking-widest">
            Tambah Gambar
          </h3>
          <button onClick={onClose} className="text-primary-dark/40 hover:text-primary-dark transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-primary-dark/10 mb-5">
          <button
            onClick={() => { setMode('upload'); setError('') }}
            className={`font-helvetica text-xs uppercase tracking-widest px-4 py-2 border-b-2 transition-colors duration-150 ${
              mode === 'upload'
                ? 'border-primary-dark text-primary-dark'
                : 'border-transparent text-primary-dark/40 hover:text-primary-dark'
            }`}
          >
            <Upload size={12} className="inline mr-1.5" />
            Upload
          </button>
          <button
            onClick={() => { setMode('url'); setError('') }}
            className={`font-helvetica text-xs uppercase tracking-widest px-4 py-2 border-b-2 transition-colors duration-150 ${
              mode === 'url'
                ? 'border-primary-dark text-primary-dark'
                : 'border-transparent text-primary-dark/40 hover:text-primary-dark'
            }`}
          >
            <LinkIcon size={12} className="inline mr-1.5" />
            URL
          </button>
        </div>

        {/* Form caption & sumber (shared) */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1.5">
              Keterangan gambar
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Opsional"
              className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40"
            />
          </div>
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1.5">
              Sumber
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Opsional"
              className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40"
            />
          </div>
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary-dark/15 rounded px-6 py-10 text-center cursor-pointer hover:border-primary-dark/30 transition-colors duration-150"
            >
              <Upload size={24} className="mx-auto text-primary-dark/30 mb-3" />
              <p className="font-helvetica text-sm text-primary-dark/50">
                {isUploading ? 'Mengupload...' : 'Klik atau drag & drop gambar di sini'}
              </p>
              <p className="font-helvetica text-xs text-primary-dark/30 mt-1">
                JPEG, PNG, WebP, GIF · Maks 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* URL mode */}
        {mode === 'url' && (
          <form onSubmit={handleUrlSubmit}>
            <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-1.5">
              URL gambar
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setError('') }}
              placeholder="https://..."
              className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="font-helvetica text-sm text-primary-dark/50 hover:text-primary-dark transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="submit"
                className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2 hover:opacity-80 transition-opacity duration-150"
              >
                Sisipkan
              </button>
            </div>
          </form>
        )}

        {error && (
          <p className="font-helvetica text-xs text-accent-red mt-3">{error}</p>
        )}

      </div>
    </div>
  )
}
