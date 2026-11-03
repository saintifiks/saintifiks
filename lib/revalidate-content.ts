// Segarkan cache halaman publik segera setelah konten berubah (terbit, ubah, tarik, koreksi disetujui).
// Halaman publik disimpan di cache (ISR); tanpa ini perubahan baru tampil setelah masa cache habis.

import { revalidatePath } from 'next/cache'

export function revalidatePublicContent(slug?: string | null): void {
  revalidatePath('/')
  revalidatePath('/artikel/[slug]', 'page')
  if (slug) revalidatePath(`/artikel/${slug}`)
  revalidatePath('/sitemap.xml')
}
