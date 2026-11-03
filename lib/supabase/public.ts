// Klien Supabase untuk membaca konten PUBLIK di server (Beranda, artikel, peta situs).
//
// Berbeda dengan lib/supabase/server.ts, klien ini TIDAK membaca cookie pengunjung. Itu penting: begitu sebuah
// halaman memanggil cookies(), Next.js merender ulang halaman itu di setiap kunjungan dan mengabaikan
// `revalidate` (header jadi `private, no-store`). Dengan klien ini halaman bisa disimpan di cache (ISR) dan
// disajikan seketika dari edge.
//
// Hanya untuk data yang sama bagi semua orang dan sudah dibatasi RLS untuk peran anon (artikel terbit,
// koreksi disetujui, grafik artikel terbit). JANGAN dipakai untuk data per-pengguna.

import { createClient } from '@supabase/supabase-js'

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('[Supabase Public] NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak tersedia')
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
