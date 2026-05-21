import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import IndexStrip from "@/components/widgets/IndexStrip";
import ConditionalIndexStrip from "@/components/layout/ConditionalIndexStrip";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Load Libre Baskerville dari Google Fonts
// weight 400 = regular, 700 = bold; style italic tersedia untuk body artikel
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

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
    // variable font Libre Baskerville ditaruh di <html> agar bisa diakses seluruh halaman
    <html lang="id" className={libreBaskerville.variable}>
      <body className="bg-primary-light text-primary-dark font-helvetica antialiased">
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
