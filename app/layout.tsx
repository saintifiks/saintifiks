import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

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
  title: "Saintifiks",
  description: "Media independen untuk pembaca yang peduli kualitas informasi publik.",
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
