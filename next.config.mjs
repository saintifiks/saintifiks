/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi gambar dari Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Optimasi performa
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // SWC Minification (sudah default, tapi eksplisit)
  swcMinify: true,
};

export default nextConfig;