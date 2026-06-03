import type { Metadata } from "next";
import { Libre_Baskerville, Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import LocationProvider from "@/components/layout/LocationProvider";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import IndexStrip from "@/components/widgets/IndexStrip";
import ConditionalIndexStrip from "@/components/layout/ConditionalIndexStrip";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ThemeTransitionOverlay from '@/components/layout/ThemeTransitionOverlay'

// Load Libre Baskerville (display/headline font) dari Google Fonts
// Libre Baskerville hanya tersedia weight 400 & 700 (tidak ada 600/SemiBold)
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
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
    // variable font Libre Baskerville, Source Serif 4, IBM Plex Sans, IBM Plex Mono ditaruh di <html> agar bisa diakses seluruh halaman
    <html lang="id" className={`${libreBaskerville.variable} ${sourceSerif4.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* Anti-FOUC dark mode: set data-theme SEBELUM render agar tidak ada kedipan tema.
            Prioritas: localStorage ('saintifiks-theme') > preferensi OS. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var s = localStorage.getItem('saintifiks-theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t = s || (d ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();`,
          }}
        />
      </head>
      <body className="bg-paper text-ink font-interface antialiased">
        {/* Skip link (WCAG 2.4.1) — terlihat hanya saat fokus keyboard */}
        <a href="#main-content" className="skip-link">Langsung ke konten</a>

        <AnalyticsTracker />
        <ScrollToTop />
        <ThemeTransitionOverlay />

        {/* IndexStrip dipasang di atas Header, tapi hanya tampil di halaman beranda (/).
            IndexStrip (Server Component) dilempar sebagai prop ke ConditionalIndexStrip
            (Client Component) — pola resmi Next.js App Router untuk kasus ini. */}
        <LocationProvider>
          <ConditionalIndexStrip strip={<IndexStrip />} />

          <Header />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </LocationProvider>
        <Footer />
      </body>
    </html>
  );
}