'use client'

// AddBookForm — buku baru di katalog (admin): data buku, varian awal (format, harga, stok), dan sampul.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Field, Input, Select, Textarea, useToast } from '@/components/ui'
import ImageUpload from '@/components/artikel/ImageUpload'
import { tambahBuku } from '@/app/(admin)/dashboard/bookstore/actions'

type Props = {
  authors: { id: string; name: string }[]
  publishers: { id: string; name: string }[]
}

export default function AddBookForm({ authors, publishers }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await tambahBuku({
      title: formData.get('title') as string,
      author_id: formData.get('author_id') as string,
      publisher_id: formData.get('publisher_id') as string,
      description: formData.get('description') as string,
      editorial_take: formData.get('editorial_take') as string,
      cover_image_url: coverUrl ?? '',
      format: formData.get('format') as string,
      price_amount: Number(formData.get('price_amount')),
      stock_qty: Number(formData.get('stock_qty')),
    })

    if ('error' in res) {
      toast({ message: res.error, tone: 'danger' })
      setLoading(false)
      return
    }
    toast({ message: 'Buku ditambahkan ke katalog.', tone: 'success', label: 'Tersimpan' })
    router.push('/dashboard/bookstore')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-9">
      <Field label="Judul buku" required>
        <Input name="title" required maxLength={250} />
      </Field>

      <div className="grid gap-9 sm:grid-cols-2">
        <Field label="Penulis" required>
          <Select name="author_id" required defaultValue="">
            <option value="" disabled>
              Pilih penulis
            </option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Penerbit" required>
          <Select name="publisher_id" required defaultValue="">
            <option value="" disabled>
              Pilih penerbit
            </option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Deskripsi">
        <Textarea name="description" maxLength={10000} />
      </Field>

      <Field label="Sudut pandang redaksi" hint="Mengapa buku ini penting dibaca. Opsional.">
        <Textarea name="editorial_take" maxLength={5000} />
      </Field>

      <fieldset className="m-0 min-w-0 border-0 border-t border-solid border-border-default/20 p-0 pt-8">
        <legend className="float-left w-full font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
          Varian dan harga awal
        </legend>
        <div className="clear-both grid gap-9 pt-7 sm:grid-cols-3">
          <Field label="Format">
            <Select name="format" defaultValue="paperback">
              <option value="paperback">Paperback</option>
              <option value="hardcover">Hardcover</option>
              <option value="ebook">E-book</option>
            </Select>
          </Field>
          <Field label="Harga (Rp)" required>
            <Input type="number" name="price_amount" required min="0" inputMode="numeric" />
          </Field>
          <Field label="Stok awal" required>
            <Input type="number" name="stock_qty" required min="0" defaultValue="0" inputMode="numeric" />
          </Field>
        </div>
      </fieldset>

      <div className="border-t border-border-default/20 pt-8">
        <ImageUpload currentImageUrl={coverUrl} onUpload={setCoverUrl} />
      </div>

      <div className="flex items-center gap-6 border-t border-border-default/20 pt-8">
        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Menyimpan' : 'Simpan ke katalog'}
        </Button>
      </div>
    </form>
  )
}
