import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/(admin)/',      // Area admin
        '/api/',          // API routes (bukan untuk indexing)
        '/login',         // Halaman login
        '/akun/tulis',    // Halaman tulis opini
        '/akun/artikel/', // Halaman edit artikel individual
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
