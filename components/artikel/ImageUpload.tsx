'use client'

// Komponen upload gambar cover artikel — dipakai di form baru dan form edit
// Menggunakan Supabase Storage bucket "artikel-gambar"
// Upload terjadi langsung dari browser (client-side) menggunakan anon key

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type ImageUploadProps = {
  // URL gambar yang sudah ada (untuk form edit — null jika belum ada)
  currentImageUrl: string | null
  // Callback dipanggil setelah upload berhasil, mengirim URL publik gambar
  onUpload: (url: string) => void
}

export default function ImageUpload({ currentImageUrl, onUpload }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file — hanya gambar yang diizinkan
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WebP, dll).')
      return
    }

    // Validasi ukuran file — maksimal 5MB
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 5MB.')
      return
    }

    setError(null)
    setIsUploading(true)

    // Tampilkan preview lokal segera sebelum upload selesai (UX lebih responsif)
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      const supabase = createClient()

      // Generate nama file unik: timestamp + nama asli (tanpa spasi)
      // Contoh: 1716123456789-foto-artikel.jpg
      const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
      const fileName = `${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('artikel-gambar')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Ambil URL publik gambar yang baru diupload
      const { data: urlData } = supabase.storage
        .from('artikel-gambar')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Kirim URL ke parent (form baru / form edit) untuk disimpan ke database
      onUpload(publicUrl)
      setPreviewUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal. Coba lagi.')
      // Kembalikan preview ke gambar sebelumnya jika upload gagal
      setPreviewUrl(currentImageUrl)
    } finally {
      setIsUploading(false)
    }
  }

  function handleHapusGambar() {
    setPreviewUrl(null)
    onUpload('')
    // Reset input agar file yang sama bisa dipilih ulang jika diperlukan
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-2">
        Gambar Cover
        <span className="ml-2 normal-case font-normal text-primary-dark/30">
          (opsional — JPG, PNG, WebP, maks 5MB)
        </span>
      </label>

      {previewUrl ? (
        // Kondisi: sudah ada gambar — tampilkan preview + tombol ganti/hapus
        <div className="border border-primary-dark/15">
          <div className="relative w-full h-48 bg-primary-dark/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview gambar cover"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-primary-light/80 flex items-center justify-center">
                <p className="font-helvetica text-xs text-primary-dark/60">
                  Mengupload...
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 px-4 py-3 border-t border-primary-dark/10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="font-helvetica text-xs text-primary-dark/60 hover:text-primary-dark transition-colors duration-150 disabled:opacity-40"
            >
              Ganti gambar
            </button>
            <span className="text-primary-dark/20 text-xs">|</span>
            <button
              type="button"
              onClick={handleHapusGambar}
              disabled={isUploading}
              className="font-helvetica text-xs text-accent-red/70 hover:text-accent-red transition-colors duration-150 disabled:opacity-40"
            >
              Hapus gambar
            </button>
          </div>
        </div>
      ) : (
        // Kondisi: belum ada gambar — tampilkan area klik untuk upload
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full border border-dashed border-primary-dark/20 py-10 px-6 text-center hover:border-primary-dark/40 hover:bg-primary-dark/[0.02] transition-all duration-150 disabled:opacity-40"
        >
          <p className="font-helvetica text-sm text-primary-dark/40">
            {isUploading ? 'Mengupload...' : 'Klik untuk pilih gambar cover'}
          </p>
          <p className="font-helvetica text-xs text-primary-dark/25 mt-1">
            JPG, PNG, WebP — maks 5MB
          </p>
        </button>
      )}

      {/* Input file tersembunyi — dipicu oleh tombol di atas */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="font-helvetica text-xs text-accent-red mt-2">{error}</p>
      )}
    </div>
  )
}
