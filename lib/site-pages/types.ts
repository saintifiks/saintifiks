export type SitePageTemplate = 'editorial' | 'policy' | 'standard'

export type SitePageFact = {
  label: string
  value: string
}

export type SitePageHighlight = {
  label?: string
  title: string
  body: string
}

export type ParagraphBlock = {
  type: 'paragraph'
  text: string
  emphasis?: boolean
}

export type ListBlock = {
  type: 'list'
  items: string[]
}

export type LinkBlock = {
  type: 'link'
  label: string
  href: string
}

export type CalloutBlock = {
  type: 'callout'
  title?: string
  body: string
  tone?: 'info' | 'warning'
}

export type CardsBlock = {
  type: 'cards'
  items: Array<{
    eyebrow?: string
    title: string
    body: string
    href?: string
    linkLabel?: string
  }>
}

export type StepsBlock = {
  type: 'steps'
  items: Array<{
    title: string
    body: string
  }>
}

export type TableBlock = {
  type: 'table'
  caption: string
  columns: string[]
  rows: string[][]
}

export type DefinitionsBlock = {
  type: 'definitions'
  items: Array<{
    term: string
    description: string
  }>
}

export type SubsectionsBlock = {
  type: 'subsections'
  items: Array<{
    title: string
    paragraphs: string[]
  }>
}

export type SitePageBlock =
  | ParagraphBlock
  | ListBlock
  | LinkBlock
  | CalloutBlock
  | CardsBlock
  | StepsBlock
  | TableBlock
  | DefinitionsBlock
  | SubsectionsBlock

export type SitePageSection = {
  id: string
  navLabel?: string
  eyebrow?: string
  title: string
  description?: string
  blocks: SitePageBlock[]
}

export type SitePageContent = {
  schemaVersion: 1
  kicker?: string
  title: string
  introduction: string
  documentMeta?: string
  notice?: {
    title: string
    body: string
    tone?: 'info' | 'warning'
  }
  facts?: SitePageFact[]
  highlights?: SitePageHighlight[]
  sections: SitePageSection[]
  footer?: {
    label?: string
    body: string
  }
}

export type SitePageDefinition = {
  slug: string
  path: string
  name: string
  template: SitePageTemplate
  description: string
  requiredSectionIds: string[]
}

export type SitePageRow = {
  id: string
  slug: string
  path: string
  name: string
  template_key: SitePageTemplate
  draft_revision_id: string | null
  published_revision_id: string | null
  created_at: string
  updated_at: string
}

export type SitePageRevisionRow = {
  id: string
  page_id: string
  version: number
  content: SitePageContent
  meta_title: string
  meta_description: string
  robots_index: boolean
  change_summary: string | null
  created_by: string | null
  created_at: string
  published_at: string | null
}

export type SitePagePublication = {
  page: SitePageRow
  revision: SitePageRevisionRow
}
