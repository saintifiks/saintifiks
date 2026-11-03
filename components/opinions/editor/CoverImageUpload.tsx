'use client'

// CoverImageUpload — gambar sampul tulisan Argumen (opsional). Tanpa gambar: satu baris bergaris dengan tombol
// "Pilih gambar" (berkas juga bisa diseret ke baris ini). Dengan gambar: pratinjau 3:1 dengan "Ganti" dan "Hapus".

import { useState, useRef } from 'react'
import { Button } from '@/components/ui'
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
      onChange(publicUrl)
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

  function pick() {
    if (!isUploading) fileInputRef.current?.click()
  }

  function handleRemove() {
    onChange('')
    setError('')
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Berkas gambar sampul"
      />

      {currentUrl ? (
        <div>
          <div className="aspect-[21/9] w-full overflow-hidden bg-surface-sunken sm:aspect-[3/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUrl} alt="Pratinjau sampul" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex items-center gap-6">
            <Button variant="text" size="sm" onClick={pick} disabled={isUploading}>
              {isUploading ? 'Mengunggah' : 'Ganti sampul'}
            </Button>
            <Button variant="danger" size="sm" onClick={handleRemove} disabled={isUploading}>
              Hapus sampul
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-y border-border-default/20 py-2"
        >
          <Button variant="text" size="sm" onClick={pick} disabled={isUploading}>
            {isUploading ? 'Mengunggah' : 'Pilih gambar sampul'}
          </Button>
          <span className="font-mono text-caption text-text-tertiary">Opsional · JPEG, PNG, WebP, GIF · maks 5 MB</span>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
          {error}
        </p>
      )}
    </div>
  )
}
