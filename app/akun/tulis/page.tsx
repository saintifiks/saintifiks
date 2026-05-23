// Halaman tulis artikel opinions baru — Server Component wrapper
// Cek login + profil, render editor atau UsernameSetup

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OpinionEditorPage from '@/components/opinions/editor/OpinionEditorPage'

export const dynamic = 'force-dynamic'

export default async function TulisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/callback?next=/akun/tulis')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  return <OpinionEditorPage hasProfile={!!profile} mode="create" />
}
