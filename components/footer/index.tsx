'use client';

// Footer — komponen utama yang menampilkan versi mobile atau desktop
// Berdasarkan breakpoint: mobile (< lg), desktop (≥ lg)

import FooterMobile from './FooterMobile';
import FooterDesktop from './FooterDesktop';

export default function Footer() {
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

// Re-export komponen individual jika diperlukan
export { default as FooterMobile } from './FooterMobile';
export { default as FooterDesktop } from './FooterDesktop';
export { default as DiamondLogo } from './DiamondLogo';
export { footerNavigation, socialLinks, copyrightText } from './footer.config';
