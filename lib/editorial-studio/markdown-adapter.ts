import {
  STUDIO_SCHEMA_VERSION,
  createStudioDocument,
  createStudioId,
  type StudioDocument,
  type StudioJsonNode,
  type StudioMark,
} from './document'

function attrs(type: StudioJsonNode['type']) {
  return { id: createStudioId(type), schemaVersion: STUDIO_SCHEMA_VERSION }
}

function inlineNodes(value: string): StudioJsonNode[] {
  const nodes: StudioJsonNode[] = []
  const pattern = /(!?\[[^\]]*\]\([^\s)]+(?:\s+"[^"]*")?\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g
  let cursor = 0

  function textNode(text: string, marks?: StudioMark[]) {
    if (text) nodes.push({ type: 'text', text, ...(marks?.length ? { marks } : {}) })
  }

  let match: RegExpExecArray | null
  while ((match = pattern.exec(value)) !== null) {
    const index = match.index ?? 0
    textNode(value.slice(cursor, index))
    const token = match[0]
    if (token.startsWith('![')) {
      textNode(token)
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/)
      if (link) textNode(link[1], [{ type: 'link', attrs: { href: link[2] } }])
      else textNode(token)
    } else if (token.startsWith('`')) {
      textNode(token.slice(1, -1), [{ type: 'code' }])
    } else if (token.startsWith('**') || token.startsWith('__')) {
      textNode(token.slice(2, -2), [{ type: 'bold' }])
    } else {
      textNode(token.slice(1, -1), [{ type: 'italic' }])
    }
    cursor = index + token.length
  }
  textNode(value.slice(cursor))
  return nodes
}

function paragraph(value = ''): StudioJsonNode {
  const content = inlineNodes(value)
  return { type: 'paragraph', attrs: attrs('paragraph'), ...(content.length ? { content } : {}) }
}

function listBlock(lines: string[], ordered: boolean): StudioJsonNode {
  const type = ordered ? 'orderedList' : 'bulletList'
  return {
    type,
    attrs: attrs(type),
    content: lines.map((line) => ({
      type: 'listItem',
      attrs: attrs('listItem'),
      content: [paragraph(line.replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/, ''))],
    })),
  }
}

function splitTableRow(line: string) {
  const value = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells: string[] = []
  let cell = ''
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '\\' && value[index + 1] === '|') {
      cell += '|'
      index += 1
    } else if (value[index] === '|') {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += value[index]
    }
  }
  cells.push(cell.trim())
  return cells
}

function isTableDelimiter(line: string) {
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function tableBlock(rows: string[][]): StudioJsonNode {
  const width = Math.max(1, ...rows.map((row) => row.length))
  return {
    type: 'table',
    attrs: attrs('table'),
    content: rows.map((row, rowIndex) => ({
      type: 'tableRow',
      attrs: attrs('tableRow'),
      content: Array.from({ length: width }, (_, columnIndex) => ({
        type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
        attrs: attrs(rowIndex === 0 ? 'tableHeader' : 'tableCell'),
        content: [paragraph(row[columnIndex] ?? '')],
      })),
    })),
  }
}

export function markdownToStudioDocument(
  markdown: string,
  options: Parameters<typeof createStudioDocument>[1] = {}
): StudioDocument {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const content: StudioJsonNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim() || null
      const code: string[] = []
      index += 1
      while (index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++])
      if (index < lines.length) index += 1
      content.push({
        type: 'codeBlock',
        attrs: { ...attrs('codeBlock'), language },
        content: code.length ? [{ type: 'text', text: code.join('\n') }] : undefined,
      })
      continue
    }

    const legacyChart = line.trim().match(/^\{\{chart:([^}]+)\}\}$/)
    if (legacyChart) {
      content.push({
        type: 'chartReference',
        attrs: {
          ...attrs('chartReference'),
          chartId: legacyChart[1].trim(),
          title: `Grafik ${legacyChart[1].trim()}`,
        },
      })
      index += 1
      continue
    }

    if (line.trim().startsWith('$$')) {
      const sameLine = line.trim().match(/^\$\$(.+)\$\$$/)
      const latex: string[] = sameLine ? [sameLine[1].trim()] : []
      index += 1
      if (!sameLine) {
        while (index < lines.length && !lines[index].trim().endsWith('$$')) latex.push(lines[index++])
        if (index < lines.length) {
          latex.push(lines[index].trim().replace(/\$\$$/, ''))
          index += 1
        }
      }
      content.push({
        type: 'equation',
        attrs: { ...attrs('equation'), latex: latex.join('\n').trim(), label: '' },
      })
      continue
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/)
    if (image) {
      content.push({
        type: 'figure',
        attrs: {
          ...attrs('figure'),
          assetId: createStudioId('figure'),
          src: image[2],
          alt: image[1] || 'Gambar artikel',
          caption: image[3] ?? '',
          credit: '',
        },
      })
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length <= 2 ? 2 : 3
      content.push({
        type: 'heading',
        attrs: { ...attrs('heading'), level },
        content: inlineNodes(heading[2]),
      })
      index += 1
      continue
    }

    if (index + 1 < lines.length && line.includes('|') && isTableDelimiter(lines[index + 1])) {
      const rows = [splitTableRow(line)]
      index += 2
      while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }
      content.push(tableBlock(rows))
      continue
    }

    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line)
      const items: string[] = []
      const matcher = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/
      while (index < lines.length && matcher.test(lines[index])) items.push(lines[index++])
      content.push(listBlock(items, ordered))
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index++].replace(/^>\s?/, ''))
      }
      content.push({ type: 'blockquote', attrs: attrs('blockquote'), content: [paragraph(quote.join(' '))] })
      continue
    }

    if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})\s*$/.test(line)) {
      content.push({ type: 'horizontalRule', attrs: attrs('horizontalRule') })
      index += 1
      continue
    }

    if (/^\s*<\/?[a-z][^>]*>/i.test(line)) {
      const legacyHtml = paragraph(line)
      legacyHtml.attrs = { ...legacyHtml.attrs, legacyRawHtml: true }
      content.push(legacyHtml)
      index += 1
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (
      index < lines.length
      && lines[index].trim()
      && !/^(#{1,6})\s+|^```|^>\s?|^\s*[-*+]\s+|^\s*\d+[.)]\s+/.test(lines[index])
    ) paragraphLines.push(lines[index++])
    content.push(paragraph(paragraphLines.join(' ')))
  }

  return createStudioDocument(
    { type: 'doc', content: content.length ? content : [paragraph()] },
    options
  )
}

function markedText(node: StudioJsonNode) {
  let value = node.text ?? ''
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') value = `**${value}**`
    else if (mark.type === 'italic') value = `*${value}*`
    else if (mark.type === 'strike') value = `~~${value}~~`
    else if (mark.type === 'code') value = `\`${value}\``
    else if (mark.type === 'link' && typeof mark.attrs?.href === 'string') {
      value = `[${value}](${mark.attrs.href})`
    }
  }
  return value
}

function inlineMarkdown(node: StudioJsonNode) {
  return (node.content ?? []).map((child) => {
    if (child.type === 'text') return markedText(child)
    if (child.type === 'hardBreak') return '  \n'
    if (child.type === 'citation') return `[${String(child.attrs?.label ?? 'Sumber')}]`
    if (child.type === 'footnote') return `^[${String(child.attrs?.note ?? '')}]`
    return ''
  }).join('')
}

function blockMarkdown(node: StudioJsonNode, depth = 0): string {
  switch (node.type) {
    case 'paragraph': return inlineMarkdown(node)
    case 'heading': return `${node.attrs?.level === 3 ? '###' : '##'} ${inlineMarkdown(node)}`
    case 'blockquote': return (node.content ?? []).map((child) => blockMarkdown(child, depth)).join('\n').split('\n').map((line) => `> ${line}`).join('\n')
    case 'bulletList': return (node.content ?? []).map((item) => `- ${blockMarkdown(item, depth + 1)}`).join('\n')
    case 'orderedList': return (node.content ?? []).map((item, index) => `${index + 1}. ${blockMarkdown(item, depth + 1)}`).join('\n')
    case 'listItem': return (node.content ?? []).map((child) => blockMarkdown(child, depth)).join('\n')
    case 'codeBlock': return `\`\`\`${String(node.attrs?.language ?? '')}\n${(node.content ?? []).map((child) => child.text ?? '').join('')}\n\`\`\``
    case 'horizontalRule': return '---'
    case 'callout': return (node.content ?? []).map((child) => blockMarkdown(child, depth)).join('\n').split('\n').map((line) => `> ${line}`).join('\n')
    case 'figure': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''
      const alt = String(node.attrs?.alt ?? '')
      const caption = String(node.attrs?.caption ?? '')
      return src ? `![${alt}](${src}${caption ? ` "${caption.replace(/"/g, '\\"')}"` : ''})` : `[Gambar: ${alt}]`
    }
    case 'equation': return `$$\n${String(node.attrs?.latex ?? '')}\n$$`
    case 'chartReference': return `{{chart:${String(node.attrs?.chartId ?? '')}}}`
    case 'datasetReference': return `[Dataset: ${String(node.attrs?.label ?? '')}]`
    case 'table': {
      const rows = (node.content ?? []).map((row) =>
        (row.content ?? []).map((cell) => inlineMarkdown(cell.content?.[0] ?? cell).replace(/\|/g, '\\|'))
      )
      if (rows.length === 0) return ''
      const width = Math.max(1, ...rows.map((row) => row.length))
      const line = (row: string[]) => `| ${Array.from({ length: width }, (_, index) => row[index] ?? '').join(' | ')} |`
      return [line(rows[0]), line(Array.from({ length: width }, () => '---')), ...rows.slice(1).map(line)].join('\n')
    }
    default: return ''
  }
}

export function studioDocumentToMarkdown(document: StudioDocument) {
  return (document.root.content ?? []).map((node) => blockMarkdown(node)).filter(Boolean).join('\n\n')
}
