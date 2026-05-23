'use client'

// Client Component wrapper untuk UsernameSetup di halaman /akun
// Setelah profil dibuat, reload halaman agar Server Component me-render dashboard

import { useRouter } from 'next/navigation'
import UsernameSetup from '@/components/opinions/editor/UsernameSetup'

type AkunClientProps = {
  hasProfile: boolean
}

export default function AkunClient({ hasProfile }: AkunClientProps) {
  const router = useRouter()

  if (hasProfile) return null

  return (
    <UsernameSetup
      onComplete={() => router.refresh()}
    />
  )
}
