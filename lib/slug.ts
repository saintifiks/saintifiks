/**
 * Generate URL-friendly slug dari string judul
 * Menangani karakter aksen, spasi, dan karakter non-alphanumeric
 * 
 * Contoh:
 *   generateSlug("Halo Dunia!") => "halo-dunia"
 *   generateSlug("Café & Resto") => "cafe-resto"
 * 
 * @param input — String untuk dikonversi (biasanya judul artikel)
 * @returns Slug yang sudah di-normalisasi
 */
export function generateSlug(input: string): string {
  return input
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

/**
 * Alias untuk backward compatibility dengan code yang menggunakan nama lama
 * @deprecated Gunakan generateSlug() untuk code baru
 */
export const buatSlug = generateSlug
