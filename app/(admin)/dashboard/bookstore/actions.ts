'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-check'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'
import {
  requiredString,
  optionalString,
  validateUUID,
  validateEnum,
  validateNonNegativeNumber,
  validateNonNegativeInteger,
  optionalHttpsUrl,
  ValidationError,
} from '@/lib/security/validation'

type HasilAksi = { error: string } | { sukses: true }

const BOOK_FORMATS = ['hardcover', 'paperback', 'ebook', 'audiobook'] as const

export async function tambahPenulis(data: { name: string; biography?: string }): Promise<HasilAksi> {
  try {
    await requireAdmin()
    const name = requiredString(data.name, 'Nama penulis', { min: 1, max: 150 })
    const biography = optionalString(data.biography, 'Biografi', { max: 5000 })

    const supabase = await createClient()
    const { error } = await supabase.from('authors').insert({ name, biography })
    if (error) return { error: 'Gagal menambah penulis ke database.' }
    revalidatePath('/dashboard/bookstore/penulis')
    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat menambah penulis.' }
  }
}

export async function tambahPenerbit(data: { name: string }): Promise<HasilAksi> {
  try {
    await requireAdmin()
    const name = requiredString(data.name, 'Nama penerbit', { min: 1, max: 150 })

    const supabase = await createClient()
    const { error } = await supabase.from('publishers').insert({ name })
    if (error) return { error: 'Gagal menambah penerbit ke database.' }
    revalidatePath('/dashboard/bookstore/penerbit')
    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat menambah penerbit.' }
  }
}

export async function tambahBuku(data: {
  title: string
  author_id: string
  publisher_id: string
  description?: string
  editorial_take?: string
  cover_image_url?: string
  format: string
  price_amount: number
  stock_qty: number
}): Promise<HasilAksi> {
  try {
    const user = await requireAdmin()
    const title = requiredString(data.title, 'Judul buku', { min: 1, max: 250 })
    const authorId = validateUUID(data.author_id, 'Penulis')
    const publisherId = validateUUID(data.publisher_id, 'Penerbit')
    const description = optionalString(data.description, 'Deskripsi', { max: 10000 })
    const editorialTake = optionalString(data.editorial_take, 'Editorial take', { max: 5000 })
    const coverImageUrl = optionalHttpsUrl(data.cover_image_url, 'URL cover')
    const format = validateEnum(data.format, BOOK_FORMATS, 'Format buku')
    const priceAmount = validateNonNegativeNumber(data.price_amount, 'Harga')
    const stockQty = validateNonNegativeInteger(data.stock_qty, 'Jumlah stok')

    const supabase = await createClient()
    const slug = generateSlug(title) + '-' + Date.now().toString(36)

    // 1. Masukkan Induk Buku
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        title,
        slug,
        author_id: authorId,
        publisher_id: publisherId,
        description,
        editorial_take: editorialTake,
        cover_image_url: coverImageUrl,
        status: 'active',
      })
      .select('id')
      .single()

    if (bookError || !book) return { error: 'Gagal membuat buku di katalog.' }

    // 2. Masukkan Varian (SKU) dengan stok awal 0
    const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
    const { data: variant, error: varError } = await supabase
      .from('book_variants')
      .insert({
        book_id: book.id,
        sku,
        format,
        price_amount: priceAmount,
        stock_qty: 0,
      })
      .select('id')
      .single()

    if (varError || !variant) return { error: 'Gagal membuat varian SKU buku.' }

    // 3. Rekam Stok Awal ke Ledger
    if (stockQty > 0) {
      await supabase.from('inventory_ledger').insert({
        variant_id: variant.id,
        delta: stockQty,
        reason: 'restock',
        actor_id: user.id,
      })
    }

    revalidatePath('/dashboard/bookstore')
    revalidatePath('/bookstore')
    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat membuat buku.' }
  }
}