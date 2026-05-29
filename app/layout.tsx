import type { Metadata } from "next";
import { Marcellus, Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import IndexStrip from "@/components/widgets/IndexStrip";
import ConditionalIndexStrip from "@/components/layout/ConditionalIndexStrip";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Load Marcellus (display font) dari Google Fonts
// Weight 400 = regular; Marcellus hanya memiliki weight 400
const marcellus = Marcellus({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})

// Load Source Serif 4 (body font) dari Google Fonts
// Weight 400 = regular, 600 = semi-bold; style italic tersedia untuk body artikel
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

// Load IBM Plex Sans (interface font) dari Google Fonts
// Weight 400 = regular, 500 = medium, 600 = semi-bold
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-interface',
  display: 'swap',
})

// Load IBM Plex Mono (data/kicker/caption font) dari Google Fonts
// Weight 400 = regular, 500 = medium
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  // metadataBase: fondasi agar og:image URL menjadi absolut
  // Twitter/X, WhatsApp, dan Facebook menolak URL relatif untuk gambar preview artikel
  // Di production: menggunakan nilai NEXT_PUBLIC_SITE_URL dari environment variable
  // Di local development: fallback ke localhost
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Saintifiks",
  description: "Media independen untuk pembaca yang peduli kualitas informasi publik.",
  // Default OG site-wide — halaman individual akan override ini
  openGraph: {
    siteName: "Saintifiks",
    locale: "id_ID",
    type: "website",
  },
  // Default Twitter Card site-wide — "summary_large_image" menampilkan gambar besar
  // saat artikel dibagikan di Twitter/X
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="id" karena seluruh konten dalam Bahasa Indonesia
    // variable font Marcellus, Source Serif 4, IBM Plex Sans, IBM Plex Mono ditaruh di <html> agar bisa diakses seluruh halaman
    <html lang="id" className={`${marcellus.variable} ${sourceSerif4.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-paper text-ink font-interface antialiased">
        <AnalyticsTracker />
        <ScrollToTop />

        {/* IndexStrip dipasang di atas Navbar, tapi hanya tampil di halaman beranda (/).
            IndexStrip (Server Component) dilempar sebagai prop ke ConditionalIndexStrip
            (Client Component) — pola resmi Next.js App Router untuk kasus ini. */}
        <ConditionalIndexStrip strip={<IndexStrip />} />

        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}