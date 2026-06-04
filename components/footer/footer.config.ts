// Data konfigurasi untuk komponen Footer
// Navigasi dan social links — sumber tunggal kebenaran

export interface NavSection {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  platform: string;
  href: string;
  ariaLabel: string;
}

export const footerNavigation: NavSection[] = [
  {
    title: 'Tentang Kami',
    links: [
      { label: 'Saintifiks', href: '/tentang-kami' },
      { label: 'Kontak', href: '/kontak' },
    ],
  },
  {
    title: 'Integritas Editorial',
    links: [
      { label: 'Panduan Editorial', href: '/panduan-editorial' },
      { label: 'Sampaikan Koreksi', href: '/koreksi' },
      { label: 'Kebijakan Iklan', href: '/kebijakan-iklan' },
    ],
  },
  {
    title: 'Keamanan',
    links: [
      { label: 'Laporkan masalah keamanan', href: '/keamanan' },
      { label: 'Kebijakan privasi', href: '/kebijakan-privasi' },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    platform: 'Instagram',
    href: 'https://instagram.com/saintifiks',
    ariaLabel: 'Ikuti Saintifiks di Instagram',
  },
  {
    platform: 'X',
    href: 'https://x.com/saintifiks',
    ariaLabel: 'Ikuti Saintifiks di X',
  },
  {
    platform: 'TikTok',
    href: 'https://tiktok.com/@saintifiks',
    ariaLabel: 'Ikuti Saintifiks di TikTok',
  },
  {
    platform: 'LinkedIn',
    href: 'https://linkedin.com/company/saintifiks',
    ariaLabel: 'Ikuti Saintifiks di LinkedIn',
  },
  {
    platform: 'Facebook',
    href: 'https://facebook.com/profile.php?id=61590297074571',
    ariaLabel: 'Ikuti Saintifiks di Facebook',
  },
];

export const copyrightText = '© 2026 Saintifiks. Seluruh hak cipta dilindungi undang-undang.';
