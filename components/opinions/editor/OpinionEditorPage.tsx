'use client'

// Client Component wrapper yang menggabungkan UsernameSetup dan OpinionEditor
// Digunakan oleh app/akun/tulis/page.tsx dan app/akun/artikel/[id]/edit/page.tsx

import { useState } from 'react'
import UsernameSetup from './UsernameSetup'
import OpinionEditor from './OpinionEditor'

type OpinionEditorPageProps = {
  hasProfile: boolean
  mode: 'create' | 'edit'
  articleId?: string
  initialTitle?: string
  initialContent?: string
  initialExcerpt?: string
  initialCoverImageUrl?: string
  initialStatus?: 'draft' | 'published' | 'hidden'
  initialCharts?: { chart_id: string; config: object }[]
  slugLocked?: boolean
}

export default function OpinionEditorPage({
  hasProfile: initialHasProfile,
  ...editorProps
}: OpinionEditorPageProps) {
  const [hasProfile, setHasProfile] = useState(initialHasProfile)

  if (!hasProfile) {
    return <UsernameSetup onComplete={() => setHasProfile(true)} />
  }

  return <OpinionEditor {...editorProps} />
}
