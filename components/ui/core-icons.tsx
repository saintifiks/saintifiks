// Ikon inti Saintifiks — digambar sendiri, bukan dari pustaka.
//
// Aturan gambar (agar terasa satu keluarga dengan logo berlian):
//  • grid 24 × 24, goresan 1,5, ujung dan sambungan TAJAM (square / miter) — tidak ada lengkung manis;
//  • bentuk bersudut seperti permata: hati bertepi segi, penanda buku bermuka V, gelembung bertaring siku;
//  • toggle (suka, simpan) berubah dari garis menjadi isi penuh.
// Ikon yang tak ada di sini jatuh ke pustaka umum (dengan ujung tajam yang sama), lihat Icon.tsx.

import type { SVGProps } from 'react'

type CoreSvgProps = Omit<SVGProps<SVGSVGElement>, 'name'> & { size?: number; filled?: boolean }

type Def = { d: string; fillable?: boolean; solid?: boolean }

const defs = {
  // Suka — hati bersegi
  heart: { d: 'M12 20.5 3.5 11.5V8L6 5h3.5L12 8l2.5-3H18l2.5 3v3.5Z', fillable: true },
  // Simpan — penanda buku berpangkal V
  bookmark: { d: 'M6.5 3.5h11v17L12 16l-5.5 4.5Z', fillable: true },
  // Bagikan — panah keluar dari nampan
  share: { d: 'M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v8h14v-8' },
  // Komentar — gelembung dengan taring siku
  comment: { d: 'M3.5 4.5h17v12H12.5L8 20.5v-4H3.5Z' },
  // Laporkan — bendera berekor takik
  flag: { d: 'M5.5 21V3.5M5.5 4.5h13l-3 4 3 4h-13' },
  // Menu lainnya — tiga berlian kecil
  more: {
    d: 'M5 10.5 6.5 12 5 13.5 3.5 12ZM12 10.5l1.5 1.5-1.5 1.5-1.5-1.5ZM19 10.5l1.5 1.5-1.5 1.5-1.5-1.5Z',
    solid: true,
  },
  // Cari
  search: { d: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5l5 5' },
  // Menu — dua garis tak sama panjang (kepala dan tubuh teks)
  menu: { d: 'M4 8h16M4 16h10' },
  close: { d: 'M5.5 5.5l13 13M18.5 5.5l-13 13' },
  'arrow-right': { d: 'M4 12h15.5M13.5 6l6 6-6 6' },
  'arrow-left': { d: 'M20 12H4.5M10.5 6l-6 6 6 6' },
  'arrow-up-right': { d: 'M7 17 17 7M8.5 7H17v8.5' },
  check: { d: 'M5 12.5l4.5 4.5L19.5 7' },
  plus: { d: 'M12 4.5v15M4.5 12h15' },
} satisfies Record<string, Def>

export type CoreIconName = keyof typeof defs

export const coreIconNames = Object.keys(defs) as CoreIconName[]

export function isCoreIcon(name: string): name is CoreIconName {
  return name in defs
}

export function CoreIcon({ name, size = 20, filled = false, ...rest }: CoreSvgProps & { name: CoreIconName }) {
  const def: Def = defs[name]
  const fill = def.solid || (def.fillable && filled) ? 'currentColor' : 'none'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...rest}
    >
      <path d={def.d} />
    </svg>
  )
}
