// Profil — nama tampil, bio, dan foto yang dilihat pembaca lain di halaman penulis dan di setiap tulisan Argumen.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import NextLink from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import ProfileForm from '@/components/akun/ProfileForm'

export const metadata: Metadata = { title: 'Profil — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function ProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun/profil')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return (
      <div className="max-w-xl">
        <p className="font-display text-body-base leading-relaxed text-text-secondary">
          Profil publik dibuat saat Anda pertama kali menulis di Argumen: Anda memilih nama pengguna dan nama tampil. Sampai
          saat itu, Anda membaca, menyimpan, dan berkomentar tanpa profil publik.
        </p>
        <NextLink href="/akun/tulis" className="mt-6 inline-block">
          <Button>Buat profil dan mulai menulis</Button>
        </NextLink>
      </div>
    )
  }

  return (
    <ProfileForm
      userId={user.id}
      username={profile.username}
      initialDisplayName={profile.display_name}
      initialBio={profile.bio ?? ''}
      initialAvatarUrl={profile.avatar_url ?? ''}
    />
  )
}
