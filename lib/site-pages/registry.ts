import type { SitePageDefinition } from './types'

export const sitePageDefinitions: SitePageDefinition[] = [
  {
    slug: 'tentang-kami',
    path: '/tentang-kami',
    name: 'Tentang Kami',
    template: 'editorial',
    description: 'Identitas, cara kerja, pendanaan, dan akuntabilitas Saintifiks.',
    requiredSectionIds: ['ai-dalam-riset', 'independensi', 'tanggung-jawab'],
  },
  {
    slug: 'kebijakan-privasi',
    path: '/kebijakan-privasi',
    name: 'Kebijakan Privasi',
    template: 'policy',
    description: 'Pusat Privasi dan penjelasan praktik pemrosesan data Saintifiks.',
    requiredSectionIds: [
      'data-yang-diproses',
      'pengukuran',
      'akun-interaksi',
      'perangkat-pihak-lain',
      'retensi',
      'hak',
      'jurnalisme',
      'keamanan-anak',
      'perubahan-kontak',
    ],
  },
  {
    slug: 'panduan-editorial',
    path: '/panduan-editorial',
    name: 'Panduan Editorial',
    template: 'standard',
    description: 'Standar riset, penulisan, sumber, koreksi, dan publikasi.',
    requiredSectionIds: [],
  },
  {
    slug: 'kebijakan-iklan',
    path: '/kebijakan-iklan',
    name: 'Kebijakan Iklan',
    template: 'policy',
    description: 'Batas komersial, pelabelan, independensi, dan konflik kepentingan.',
    requiredSectionIds: [],
  },
  {
    slug: 'kontak',
    path: '/kontak',
    name: 'Kontak',
    template: 'standard',
    description: 'Jalur komunikasi publik Saintifiks.',
    requiredSectionIds: [],
  },
  {
    slug: 'keamanan',
    path: '/keamanan',
    name: 'Keamanan',
    template: 'standard',
    description: 'Panduan pelaporan kerentanan dan batas kanal keamanan.',
    requiredSectionIds: [],
  },
  {
    slug: 'bagikan-ide',
    path: '/bagikan-ide',
    name: 'Bagikan Ide',
    template: 'standard',
    description: 'Panduan dan kanal pengiriman gagasan dari pembaca.',
    requiredSectionIds: [],
  },
]

export function getSitePageDefinition(slug: string) {
  return sitePageDefinitions.find((page) => page.slug === slug) ?? null
}
