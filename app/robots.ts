import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://saintifiks.vercel.app'

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
