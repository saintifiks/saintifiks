'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  excerpt: string
  charts: { identifier: string; config: string }[]
}): Promise<HasilAksi> {
  if (!data.title.trim()) return { error: 'Judul artikel tidak boleh kosong.' }
  if (!data.content.trim()) return { error: 'Isi artikel tidak boleh kosong.' }

  const supabase = await createClient()
  const slugFinal = data.slug.trim() || buatSlugDariJudul(data.title)

  // 1. Insert Artikel
  const { data: newArticle, error: articleError } = await supabase
    .from('articles')
    .insert({
      title: data.title.trim(),
      slug: slugFinal,
      content: data.content,
      excerpt: data.excerpt.trim() || null,
      is_published: false,
    })
    .select('id')
    .single()

  if (articleError) {
    if (articleError.code === '23505') {
      return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
    }
    return { error: `Gagal menyimpan artikel: ${articleError.message}` }
  }

  // 2. Insert Chart (jika ada)
  if (data.charts && data.charts.length > 0) {
    try {
      const chartPayload = data.charts.map(c => ({
        article_id: newArticle.id,
        chart_identifier: c.identifier,
        config: JSON.parse(c.config) // Parsing string ke JSON valid untuk Supabase
      }))

      const { error: chartError } = await supabase
        .from('article_charts')
        .insert(chartPayload)

      if (chartError) {
        return { error: `Artikel tersimpan, tapi gagal menyimpan data chart: ${chartError.message}` }
      }
    } catch (err) {
      return { error: 'Gagal memproses JSON chart. Pastikan format konfigurasi valid.' }
    }
  }

  redirect('/dashboard')
}

export async function updateArtikel(
  id: string,
  data: {
    title: string
    slug: string
    content: string
    excerpt: string
    charts: { identifier: string; config: string }[]
  }
): Promise<HasilAksi> {
  if (!data.title.trim()) return { error: 'Judul artikel tidak boleh kosong.' }
  if (!data.content.trim()) return { error: 'Isi artikel tidak boleh kosong.' }

  const supabase = await createClient()
  const slugFinal = data.slug.trim() || buatSlugDariJudul(data.title)

  // 1. Update Artikel
  const { error: articleError } = await supabase
    .from('articles')
    .update({
      title: data.title.trim(),
      slug: slugFinal,
      content: data.content,
      excerpt: data.excerpt.trim() || null,
    })
    .eq('id', id)

  if (articleError) {
    if (articleError.code === '23505') {
      return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
    }
    return { error: `Gagal menyimpan perubahan: ${articleError.message}` }
  }

  // 2. Idempotent Update untuk Chart: Hapus yang lama, masukkan yang baru
  await supabase.from('article_charts').delete().eq('article_id', id)

  if (data.charts && data.charts.length > 0) {
    try {
      const chartPayload = data.charts.map(c => ({
        article_id: id,
        chart_identifier: c.identifier,
        config: JSON.parse(c.config)
      }))

      const { error: chartError } = await supabase
        .from('article_charts')
        .insert(chartPayload)

      if (chartError) {
        return { error: `Artikel terupdate, tapi gagal menyimpan pembaruan chart: ${chartError.message}` }
      }
    } catch (err) {
      return { error: 'Gagal memproses JSON chart. Pastikan format konfigurasi valid.' }
    }
  }

  return { sukses: true }
}

export async function terbitkanArtikel(id: string): Promise<HasilAksi> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('articles')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: `Gagal menerbitkan artikel: ${error.message}` }
  }
  
  redirect('/dashboard')
}

export async function jadikanDraft(id: string): Promise<HasilAksi> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('articles')
    .update({
      is_published: false,
      published_at: null,
    })
    .eq('id', id)

  if (error) {
    return { error: `Gagal mengubah status artikel: ${error.message}` }
  }

  return { sukses: true }
}