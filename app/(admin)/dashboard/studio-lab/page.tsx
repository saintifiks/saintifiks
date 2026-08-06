import type { Metadata } from 'next'
import StudioLab from '@/components/editorial-studio/StudioLab'

export const metadata: Metadata = {
  title: 'Editorial Studio — Saintifiks Admin',
  robots: { index: false, follow: false },
}

export default function EditorialStudioLabPage() {
  return <StudioLab />
}
