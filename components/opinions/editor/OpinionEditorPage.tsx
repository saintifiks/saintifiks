'use client'

// Client Component wrapper yang menggabungkan UsernameSetup dan OpinionEditor
// Digunakan oleh app/akun/tulis/page.tsx dan app/akun/artikel/[id]/edit/page.tsx

import { useState } from 'react'
import UsernameSetup from './UsernameSetup'
import OpinionEditor from './OpinionEditor'

type OpinionEditorPageProps = {
  hasProfile: boolean
  authorUsername?: string
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
  authorUsername: initialUsername,
  ...editorProps
}: OpinionEditorPageProps) {
  const [hasProfile, setHasProfile] = useState(initialHasProfile)
  const [username, setUsername] = useState(initialUsername)

  if (!hasProfile) {
    return (
      <UsernameSetup
        onComplete={(name) => {
          setUsername(name)
          setHasProfile(true)
        }}
      />
    )
  }

  return <OpinionEditor authorUsername={username} {...editorProps} />
}
