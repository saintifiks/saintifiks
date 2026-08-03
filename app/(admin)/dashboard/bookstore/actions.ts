'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'

type HasilAksi = { error: string } | { sukses: true }

export async function tambahPenulis(data: { name: string; biography: string }): Promise<HasilAksi> {
  if (!data.name.trim()) return { error: 'Nama penulis tidak boleh kosong.' }
  const supabase = await createClient()
  const { error } = await supabase.from('authors').insert({ name: data.name.trim(), biography: data.biography.trim() || null })
  if (error) return { error: `Gagal menambah penulis: ${error.message}` }
  revalidatePath('/dashboard/bookstore/penulis')
  return { sukses: true }
}

export async function tambahPenerbit(data: { name: string }): Promise<HasilAksi> {
  if (!data.name.trim()) return { error: 'Nama penerbit tidak boleh kosong.' }
  const supabase = await createClient()
  const { error } = await supabase.from('publishers').insert({ name: data.name.trim() })
  if (error) return { error: `Gagal menambah penerbit: ${error.message}` }
  revalidatePath('/dashboard/bookstore/penerbit')
  return { sukses: true }
}

// Logika canggih pembuat Buku + Varian SKU + Catatan Inventaris
export async function tambahBuku(data: {
  title: string; author_id: string; publisher_id: string;
  description: string; editorial_take: string; cover_image_url: string;
  format: string; price_amount: number; stock_qty: number;
}): Promise<HasilAksi> {
  const supabase = await createClient()
  const slug = generateSlug(data.title) + '-' + Date.now().toString(36)

  // 1. Masukkan Induk Buku
  const { data: book, error: bookError } = await supabase.from('books').insert({
    title: data.title,
    slug: slug,
    author_id: data.author_id,
    publisher_id: data.publisher_id,
    description: data.description || null,
    editorial_take: data.editorial_take || null,
    cover_image_url: data.cover_image_url || null,
    status: 'active'
  }).select('id').single()

  if (bookError || !book) return { error: `Gagal membuat buku: ${bookError?.message}` }

  // 2. Masukkan Varian (SKU) dengan stok awal 0 (Sesuai aturan arsitektur Enterprise)
  const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
  const { data: variant, error: varError } = await supabase.from('book_variants').insert({
    book_id: book.id,
    sku: sku,
    format: data.format,
    price_amount: data.price_amount,
    stock_qty: 0 
  }).select('id').single()

  if (varError || !variant) return { error: `Gagal membuat varian: ${varError?.message}` }

  // 3. Rekam Stok Awal ke Ledger (Trigger otomatis akan mengisi stok varian)
  if (data.stock_qty > 0) {
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('inventory_ledger').insert({
      variant_id: variant.id,
      delta: data.stock_qty,
      reason: 'restock',
      actor_id: userData.user?.id
    })
  }

  revalidatePath('/dashboard/bookstore')
  revalidatePath('/bookstore')
  return { sukses: true }
}