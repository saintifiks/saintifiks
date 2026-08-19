'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-check'
import { redirect } from 'next/navigation'
import {
  requiredString,
  optionalString,
  validateUUID,
  optionalHttpsUrl,
  ValidationError,
} from '@/lib/security/validation'

type HasilAksi = { error: string } | { sukses: true }

function buatSlugDariJudul(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[àáâäãåā]/g, 'a')
    .replace(/[èéêëē]/g, 'e')
    .replace(/[ìíîïī]/g, 'i')
    .replace(/[òóôöõøō]/g, 'o')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function buatArtikelBaru(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image_url?: string | null
  charts?: { identifier: string; config: string }[]
}): Promise<HasilAksi> {
  let shouldRedirect = false
  try {
    await requireAdmin()
    const title = requiredString(data.title, 'Judul artikel', { min: 1, max: 300 })
    const content = requiredString(data.content, 'Isi artikel', { min: 1, max: 200000 })
    const excerpt = optionalString(data.excerpt, 'Ringkasan', { max: 2000 })
    const coverImageUrl = optionalHttpsUrl(data.cover_image_url, 'URL gambar sampul')
    const rawSlug = data.slug ? data.slug.trim() : ''
    const slugFinal = (rawSlug || buatSlugDariJudul(title)).slice(0, 150)

    const supabase = await createClient()

    // 1. Insert Artikel
    const { data: newArticle, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        slug: slugFinal,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        is_published: false,
      })
      .select('id')
      .single()

    if (articleError) {
      if (articleError.code === '23505') {
        return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
      }
      return { error: 'Gagal menyimpan artikel ke database.' }
    }

    // 2. Insert Chart (jika ada)
    if (data.charts && Array.isArray(data.charts) && data.charts.length > 0) {
      try {
        const chartPayload = data.charts.slice(0, 50).map((c) => ({
          article_id: newArticle.id,
          chart_identifier: requiredString(c.identifier, 'Identifier grafik', { min: 1, max: 100 }),
          config: JSON.parse(requiredString(c.config, 'Konfigurasi grafik', { min: 2, max: 50000 })),
        }))

        const { error: chartError } = await supabase
          .from('article_charts')
          .insert(chartPayload)

        if (chartError) {
          return { error: 'Artikel tersimpan, tetapi konfigurasi grafik gagal disimpan.' }
        }
      } catch {
        return { error: 'Gagal memproses JSON chart. Pastikan format konfigurasi valid.' }
      }
    }

    shouldRedirect = true
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat membuat artikel.' }
  }

  if (shouldRedirect) {
    redirect('/dashboard')
  }
  return { sukses: true }
}

export async function updateArtikel(
  id: string,
  data: {
    title: string
    slug: string
    content: string
    excerpt?: string
    cover_image_url?: string | null
    charts?: { identifier: string; config: string }[]
  }
): Promise<HasilAksi> {
  try {
    await requireAdmin()
    const articleId = validateUUID(id, 'ID Artikel')
    const title = requiredString(data.title, 'Judul artikel', { min: 1, max: 300 })
    const content = requiredString(data.content, 'Isi artikel', { min: 1, max: 200000 })
    const excerpt = optionalString(data.excerpt, 'Ringkasan', { max: 2000 })
    const coverImageUrl = optionalHttpsUrl(data.cover_image_url, 'URL gambar sampul')
    const rawSlug = data.slug ? data.slug.trim() : ''
    const slugFinal = (rawSlug || buatSlugDariJudul(title)).slice(0, 150)

    const supabase = await createClient()

    // 1. Update Artikel
    const { error: articleError } = await supabase
      .from('articles')
      .update({
        title,
        slug: slugFinal,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
      })
      .eq('id', articleId)

    if (articleError) {
      if (articleError.code === '23505') {
        return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
      }
      return { error: 'Gagal menyimpan perubahan artikel.' }
    }

    // 2. Idempotent Update untuk Chart: Hapus yang lama, masukkan yang baru
    await supabase.from('article_charts').delete().eq('article_id', articleId)

    if (data.charts && Array.isArray(data.charts) && data.charts.length > 0) {
      try {
        const chartPayload = data.charts.slice(0, 50).map((c) => ({
          article_id: articleId,
          chart_identifier: requiredString(c.identifier, 'Identifier grafik', { min: 1, max: 100 }),
          config: JSON.parse(requiredString(c.config, 'Konfigurasi grafik', { min: 2, max: 50000 })),
        }))

        const { error: chartError } = await supabase
          .from('article_charts')
          .insert(chartPayload)

        if (chartError) {
          return { error: 'Artikel terupdate, tapi gagal menyimpan pembaruan chart.' }
        }
      } catch {
        return { error: 'Gagal memproses JSON chart. Pastikan format konfigurasi valid.' }
      }
    }

    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat memperbarui artikel.' }
  }
}

export async function terbitkanArtikel(id: string): Promise<HasilAksi> {
  let shouldRedirect = false
  try {
    await requireAdmin()
    const articleId = validateUUID(id, 'ID Artikel')
    const supabase = await createClient()
    const { error } = await supabase
      .from('articles')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    if (error) {
      return { error: 'Gagal menerbitkan artikel.' }
    }
    shouldRedirect = true
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat menerbitkan artikel.' }
  }

  if (shouldRedirect) {
    redirect('/dashboard')
  }
  return { sukses: true }
}

export async function jadikanDraft(id: string): Promise<HasilAksi> {
  try {
    await requireAdmin()
    const articleId = validateUUID(id, 'ID Artikel')
    const supabase = await createClient()
    const { error } = await supabase
      .from('articles')
      .update({
        is_published: false,
        published_at: null,
      })
      .eq('id', articleId)

    if (error) {
      return { error: 'Gagal mengubah status artikel.' }
    }

    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat mengubah status artikel.' }
  }
}