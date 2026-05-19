'use server'

// Server Actions untuk form artikel admin Saintifiks
// File ini berjalan di server — aman untuk akses Supabase langsung
// Dipanggil dari Client Components (form baru & edit) via import biasa

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ---------------------------------------------------------------------------
// TIPE DATA
// ---------------------------------------------------------------------------

// Tipe kembalian dari setiap Server Action
// Jika ada error: kembalikan { error: "..." }
// Jika berhasil dan perlu tetap di halaman: kembalikan { sukses: true }
// Jika berhasil dan perlu redirect: fungsi langsung memanggil redirect()
type HasilAksi = { error: string } | { sukses: true }

// ---------------------------------------------------------------------------
// HELPER PRIBADI
// ---------------------------------------------------------------------------

// Konversi judul artikel menjadi slug URL-friendly
// Contoh: "Inflasi Indonesia 2026" → "inflasi-indonesia-2026"
// Contoh: "GDP & Kemiskinan: Masalah Nyata" → "gdp-kemiskinan-masalah-nyata"
function buatSlugDariJudul(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[àáâäãåā]/g, 'a')
    .replace(/[èéêëē]/g, 'e')
    .replace(/[ìíîïī]/g, 'i')
    .replace(/[òóôöõøō]/g, 'o')
    .replace(/[ùúûüū]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '') // hapus semua karakter selain huruf, angka, spasi, strip
    .trim()
    .replace(/\s+/g, '-')         // spasi → strip
    .replace(/-+/g, '-')          // strip berulang → satu strip
}

// ---------------------------------------------------------------------------
// SERVER ACTION: BUAT ARTIKEL BARU (SIMPAN SEBAGAI DRAFT)
// ---------------------------------------------------------------------------
// Dipanggil dari: app/(admin)/dashboard/artikel/baru/page.tsx
// Tombol yang memicu: "Simpan Draft"
// Hasil jika berhasil: redirect ke /dashboard
// Hasil jika gagal: kembalikan { error: "..." } agar form bisa tampilkan pesan

export async function buatArtikelBaru(data: {
  title: string
  slug: string
  content: string
  excerpt: string
}): Promise<HasilAksi> {
  // Validasi dasar — field wajib tidak boleh kosong
  if (!data.title.trim()) {
    return { error: 'Judul artikel tidak boleh kosong.' }
  }
  if (!data.content.trim()) {
    return { error: 'Isi artikel tidak boleh kosong.' }
  }

  const supabase = await createClient()

  // Gunakan slug yang diisi user, atau auto-generate dari judul jika kosong
  const slugFinal = data.slug.trim() || buatSlugDariJudul(data.title)

  const { error } = await supabase
    .from('articles')
    .insert({
      title: data.title.trim(),
      slug: slugFinal,
      content: data.content,
      excerpt: data.excerpt.trim() || null,
      is_published: false,
      // published_at dibiarkan null untuk draft
    })

  if (error) {
    // Kode 23505 = unique constraint violation = slug sudah dipakai artikel lain
    if (error.code === '23505') {
      return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
    }
    return { error: `Gagal menyimpan artikel: ${error.message}` }
  }

  // Berhasil → kembali ke dashboard
  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// SERVER ACTION: UPDATE ARTIKEL YANG SUDAH ADA
// ---------------------------------------------------------------------------
// Dipanggil dari: app/(admin)/dashboard/artikel/[id]/edit/page.tsx
// Tombol yang memicu: "Simpan Perubahan"
// Hasil jika berhasil: kembalikan { sukses: true } (tetap di halaman edit)
// Hasil jika gagal: kembalikan { error: "..." }

export async function updateArtikel(
  id: string,
  data: {
    title: string
    slug: string
    content: string
    excerpt: string
  }
): Promise<HasilAksi> {
  if (!data.title.trim()) {
    return { error: 'Judul artikel tidak boleh kosong.' }
  }
  if (!data.content.trim()) {
    return { error: 'Isi artikel tidak boleh kosong.' }
  }

  const supabase = await createClient()

  const slugFinal = data.slug.trim() || buatSlugDariJudul(data.title)

  const { error } = await supabase
    .from('articles')
    .update({
      title: data.title.trim(),
      slug: slugFinal,
      content: data.content,
      excerpt: data.excerpt.trim() || null,
      // updated_at diperbarui otomatis oleh trigger database
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: `Slug "${slugFinal}" sudah dipakai artikel lain. Ubah slug di kolom Slug, lalu coba lagi.` }
    }
    return { error: `Gagal menyimpan perubahan: ${error.message}` }
  }

  return { sukses: true }
}

// ---------------------------------------------------------------------------
// SERVER ACTION: TERBITKAN ARTIKEL
// ---------------------------------------------------------------------------
// Dipanggil dari: form baru ATAU form edit
// Tombol yang memicu: "Terbitkan Sekarang"
// Alur: simpan dulu (update/insert terbaru), lalu set is_published = true
// Hasil jika berhasil: redirect ke /dashboard
// Hasil jika gagal: kembalikan { error: "..." }

export async function terbitkanArtikel(
  id: string
): Promise<HasilAksi> {
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

  // Berhasil → kembali ke dashboard untuk lihat status "Diterbitkan"
  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// SERVER ACTION: TARIK KEMBALI KE DRAFT
// ---------------------------------------------------------------------------
// Dipanggil dari: form edit (jika artikel sudah diterbitkan)
// Tombol yang memicu: "Jadikan Draft"
// Hasil jika berhasil: kembalikan { sukses: true }

export async function jadikanDraft(
  id: string
): Promise<HasilAksi> {
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
