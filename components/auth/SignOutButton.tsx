'use client'

import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  async function signOut() {
    await createClient().auth.signOut()
    window.location.href = '/'
  }
  return (
    <Button variant="text" size="sm" onClick={signOut}>
      Keluar
    </Button>
  )
}
