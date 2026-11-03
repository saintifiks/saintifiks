// Layout Bookstore — keranjang hanya dimuat di sini (dulu di layout akar sehingga ikut dimuat di setiap halaman).
// Bookstore ditunda dari alur utama (tidak di menu, tidak diindeks) sampai produknya jelas; alamat tetap berfungsi.

import type { Metadata } from 'next'
import { CartProvider } from '@/components/bookstore/CartProvider'

export const metadata: Metadata = { robots: { index: false, follow: true } }

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
