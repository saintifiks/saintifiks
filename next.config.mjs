/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi gambar dari Supabase Storage
  // CATATAN: Hanya gambar dari *.supabase.co yang dioptimasi via <Image> Next.js.
  // Gambar dari sumber eksternal (BPS, Wikipedia, dll.) tetap pakai <img> biasa
  // — ini ditangani di ArticleRenderer.tsx dengan pendekatan hibrida.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Alamat lama Argumen (/opinions) dialihkan permanen ke /argumen; tautan dan hasil pencarian lama tetap sampai.
  async redirects() {
    return [
      { source: '/opinions', destination: '/argumen', permanent: true },
      { source: '/opinions/:path*', destination: '/argumen/:path*', permanent: true },
    ];
  },

  // Hapus console.log di production agar tidak bocor ke browser pengunjung
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;