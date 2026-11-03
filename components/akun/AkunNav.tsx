'use client'

// AkunNav — navigasi antarbagian Akun. Satu baris yang bisa digeser di ponsel; bagian aktif bergaris bawah tinta.
// Tanpa ikon dan tanpa warna: tanda aktif adalah garis dan ketebalan huruf.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { label: 'Ringkasan', href: '/akun', exact: true },
  { label: 'Tulisan', href: '/akun/tulisan' },
  { label: 'Aktivitas', href: '/akun/aktivitas' },
  { label: 'Daftar Bacaan', href: '/akun/bacaan' },
  { label: 'Profil', href: '/akun/profil' },
  { label: 'Pengaturan', href: '/akun/pengaturan' },
]

export default function AkunNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Bagian akun" className="mt-8 border-b border-border-default/20">
      <ul className="-mb-px flex gap-7 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-[44px] items-center border-b py-2 font-interface text-sm transition-colors duration-fast',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
                  active
                    ? 'border-text-primary font-semibold text-text-primary'
                    : 'border-transparent text-text-secondary hover:border-text-primary hover:text-text-primary',
                ].join(' ')}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
