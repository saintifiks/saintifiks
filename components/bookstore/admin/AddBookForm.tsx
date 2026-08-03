'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/artikel/ImageUpload'
import { tambahBuku } from '@/app/(admin)/dashboard/bookstore/actions'

type Props = {
  authors: { id: string, name: string }[]
  publishers: { id: string, name: string }[]
}

export default function AddBookForm({ authors, publishers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      author_id: formData.get('author_id') as string,
      publisher_id: formData.get('publisher_id') as string,
      description: formData.get('description') as string,
      editorial_take: formData.get('editorial_take') as string,
      cover_image_url: coverUrl ?? '',
      format: formData.get('format') as string,
      price_amount: Number(formData.get('price_amount')),
      stock_qty: Number(formData.get('stock_qty')),
    }

    const res = await tambahBuku(data)
    if ('error' in res) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/dashboard/bookstore')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-primary-dark/10 p-6 space-y-6">
      {error && <div className="p-3 bg-signal-danger/10 text-signal-danger text-sm">{error}</div>}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Judul Buku</label>
            <input type="text" name="title" required className="w-full border px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Penulis</label>
              <select name="author_id" required className="w-full border px-3 py-2 text-sm bg-white">
                <option value="">-- Pilih Penulis --</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Penerbit</label>
              <select name="publisher_id" required className="w-full border px-3 py-2 text-sm bg-white">
                <option value="">-- Pilih Penerbit --</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Deskripsi</label>
            <textarea name="description" rows={4} className="w-full border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Sudut Pandang Redaksi (Editorial Take)</label>
            <textarea name="editorial_take" rows={3} className="w-full border px-3 py-2 text-sm" placeholder="Mengapa buku ini penting dibaca..." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-sunken p-4 border border-border-default/30">
            <h3 className="font-bold text-sm mb-3">Varian & Harga Awal</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Format</label>
                <select name="format" className="w-full border px-3 py-2 text-sm bg-white">
                  <option value="paperback">Paperback (Buku Fisik)</option>
                  <option value="hardcover">Hardcover</option>
                  <option value="ebook">E-Book</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Harga (Rp)</label>
                  <input type="number" name="price_amount" required min="0" className="w-full border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-primary-dark/50 uppercase tracking-widest mb-1">Stok Awal</label>
                  <input type="number" name="stock_qty" required min="0" defaultValue="0" className="w-full border px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ImageUpload currentImageUrl={coverUrl} onUpload={setCoverUrl} />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-primary-dark/10 text-right">
        <button type="submit" disabled={loading} className="bg-primary-dark text-primary-light px-8 py-3 text-sm hover:opacity-80 disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Simpan Buku ke Katalog'}
        </button>
      </div>
    </form>
  )
}