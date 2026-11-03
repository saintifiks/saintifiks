// Kerangka ruang Akun pembaca: kepala (foto, nama, alamat surel) dan navigasi antarbagian. Editor tulis (/akun/tulis,
// /akun/artikel/[id]/edit) sengaja di luar kerangka ini agar layar menulis tetap penuh.
// Halaman di dalamnya sendiri yang mengarahkan pembaca belum masuk ke /masuk.

import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui'
import UiLink from '@/components/ui/Link'
import AkunNav from '@/components/akun/AkunNav'

export default async function AkunLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <main className="min-h-screen bg-surface-page">{children}</main>

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const googleName = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
  const googleAvatar =
    typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null
  const name = profile?.display_name ?? googleName ?? 'Akun Saintifiks'
  const avatar = profile?.avatar_url ?? googleAvatar

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <header className="flex items-center gap-5">
          <Avatar name={name} src={avatar} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-display-sm leading-tight text-text-primary">{name}</h1>
            <p className="mt-1 truncate font-mono text-caption text-text-tertiary">
              {user.email}
              {profile && (
                <>
                  {' · '}
                  <UiLink href={`/penulis/${profile.username}`} variant="muted">
                    @{profile.username}
                  </UiLink>
                </>
              )}
            </p>
          </div>
        </header>

        <AkunNav />

        <div className="mt-10">{children}</div>
      </div>
    </main>
  )
}
