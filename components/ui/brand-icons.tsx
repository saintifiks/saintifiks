// Ikon merek Saintifiks — digambar di grid 24×24 dengan goresan 1,5 (sama dengan set umum)
// dan memakai bentuk dasar berlian dari logo (persegi diputar 45°: titik di 12,2 / 22,12 / 12,22 / 2,12).
// Hanya `currentColor`; warna diatur oleh pemakai.

import type { SVGProps } from 'react'

type BrandSvgProps = Omit<SVGProps<SVGSVGElement>, 'name'> & { size?: number }

function Base({ size = 20, children, ...rest }: BrandSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...rest}
    >
      {children}
    </svg>
  )
}

const DIAMOND = 'M12 2.5 21.5 12 12 21.5 2.5 12Z'

// Koreksi — berlian dengan centang di dalamnya.
function Koreksi(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <path d="m8.5 12.2 2.5 2.5 4.5-5" />
    </Base>
  )
}

// Angka — berlian dengan tiga batang naik (data).
function Angka(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <path d="M9.5 14.5v-1.5M12 14.5V10.5M14.5 14.5v-3" />
    </Base>
  )
}

// Argumen — dua berlian saling bertumpuk (dua sudut pandang).
function Argumen(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d="M8.5 4 15 10.5 8.5 17 2 10.5Z" />
      <path d="M15.5 7 22 13.5 15.5 20 9 13.5Z" />
    </Base>
  )
}

// Sumber — berlian dengan garis rujukan (kutipan/sitasi).
function Sumber(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <path d="M9.5 10.5h5M9.5 13.5h3" />
    </Base>
  )
}

// Metodologi — berlian dengan titik-titik tersambung (langkah).
function Metodologi(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <circle cx="9.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.4 12h3.2" />
    </Base>
  )
}

// Verifikasi — berlian ganda (garis dalam) = diperiksa dua kali.
function Verifikasi(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <path d="M12 7 17 12 12 17 7 12Z" />
    </Base>
  )
}

// Pembaruan — berlian dengan panah melingkar kecil (artikel diperbarui).
function Pembaruan(p: BrandSvgProps) {
  return (
    <Base {...p}>
      <path d={DIAMOND} />
      <path d="M14.8 10.2A3.2 3.2 0 1 0 15.2 13" />
      <path d="M15 8.6v1.8h-1.8" />
    </Base>
  )
}

export const brandIcons = {
  'brand-koreksi': Koreksi,
  'brand-angka': Angka,
  'brand-argumen': Argumen,
  'brand-sumber': Sumber,
  'brand-metodologi': Metodologi,
  'brand-verifikasi': Verifikasi,
  'brand-pembaruan': Pembaruan,
} as const

export type BrandIconName = keyof typeof brandIcons
