'use client';

// Footer — komponen utama yang menampilkan versi mobile atau desktop
// Berdasarkan breakpoint: mobile (< lg), desktop (≥ lg)

import FooterMobile from './FooterMobile';
import FooterDesktop from './FooterDesktop';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <>
      {/* Mobile version — tampil di layar kecil (< 1024px) */}
      <div className="block lg:hidden">
        <FooterMobile />
      </div>

      {/* Desktop version — tampil di layar besar (≥ 1024px) */}
      <div className="hidden lg:block">
        <FooterDesktop />
      </div>
    </>
  );
}
