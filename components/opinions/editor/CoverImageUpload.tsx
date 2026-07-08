'use client'

import { useState, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CoverImageUploadProps = {
  currentUrl: string | null | undefined
  onChange: (url: string) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export default function CoverImageUpload({ currentUrl, onChange }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      onChange(publicUrl)
    } catch (err: any) {
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

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation() // Mencegah terpicunya klik pada dropzone
    onChange('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <label className="block font-helvetica text-xs text-text-secondary uppercase tracking-widest mb-1.5">
        Gambar Cover
      </label>
      {currentUrl ? (
        <div className="relative group w-full aspect-[21/9] sm:aspect-[3/1] bg-surface-sunken overflow-hidden border border-border-default/10 rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Cover Preview"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover / always visible on mobile */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-helvetica text-xs uppercase tracking-widest hover:opacity-80 transition-colors duration-150 min-h-[44px] min-w-[44px] rounded-sm"
              aria-label="Hapus gambar cover"
            >
              <X size={16} />
              <span>Hapus Cover</span>
            </button>
          </div>
          {/* Mobile delete button: always visible or easy to tap */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors duration-150 md:hidden w-11 h-11 rounded-full"
            aria-label="Hapus gambar cover"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="w-full aspect-[21/9] sm:aspect-[3/1] border-2 border-dashed border-border-default/15 hover:border-border-accent/40 bg-surface-sunken/30 rounded-sm flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-colors duration-150 min-h-[120px]"
        >
          <Upload size={24} className="text-text-secondary/40 mb-2" />
          <p className="font-helvetica text-sm text-text-secondary">
            {isUploading ? 'Mengupload...' : 'Klik atau drag & drop untuk upload cover image'}
          </p>
          <p className="font-helvetica text-xs text-text-tertiary mt-1">
            JPEG, PNG, WebP, GIF · Maks 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      {error && (
        <p className="font-helvetica text-xs text-accent-red mt-2">{error}</p>
      )}
    </div>
  )
}
