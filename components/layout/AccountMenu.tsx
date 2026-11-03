'use client'

// AccountMenu — pintu akun di header (desktop).
//  • Belum masuk: tautan "Masuk" (membawa halaman saat ini agar kembali ke sini setelah masuk).
//  • Sudah masuk: foto/inisial; menu berisi akun, menulis, dan keluar.
// Di ponsel pintu akun ada di Menu layar penuh (Drawer).

import { usePathname } from 'next/navigation'
import Link from '@/components/ui/Link'
import Menu from '@/components/ui/Menu'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function AccountMenu({ className = '' }: { className?: string }) {
  const { user, ready } = useAuth()
  const pathname = usePathname()

  async function signOut() {
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className={['min-h-[44px] min-w-[3.5rem] items-center justify-end', className].filter(Boolean).join(' ')}>
      {!ready ? null : !user ? (
        <Link href={`/masuk?next=${encodeURIComponent(pathname)}`} variant="nav">
          Masuk
        </Link>
      ) : (
        <Menu
          label="Menu akun"
          trigger={<Avatar name={user.name ?? user.email ?? 'Akun'} src={user.avatarUrl} size="sm" />}
          heading={
            <>
              <p className="truncate font-display text-base text-text-primary">{user.name ?? 'Akun Saintifiks'}</p>
              {user.email && <p className="mt-0.5 truncate font-mono text-caption text-text-tertiary">{user.email}</p>}
            </>
          }
          items={[
            { label: 'Akun saya', href: '/akun' },
            { label: 'Tulis artikel', href: '/akun/tulis' },
            { label: 'Keluar', onSelect: signOut },
          ]}
        />
      )}
    </div>
  )
}
