import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',     // Ruang kerja admin (alamat sebenarnya; "(admin)" hanya nama folder internal)
        '/api/',          // API routes (bukan untuk indexing)
        '/login',         // Halaman login lama (diarahkan ke /masuk)
        '/masuk',         // Halaman masuk
        '/akun',          // Akun pembaca, Daftar Bacaan, menulis, dan edit tulisan (semua pribadi)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
