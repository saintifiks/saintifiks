import test from 'node:test'
import assert from 'node:assert/strict'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'id'],
    div: [...(defaultSchema.attributes?.['div'] ?? []), 'className', 'id', 'dataCalloutType'],
    blockquote: [...(defaultSchema.attributes?.['blockquote'] ?? []), 'dataCalloutType'],
    code: [...(defaultSchema.attributes?.['code'] ?? []), 'className'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className'],
  },
}

function findNodes(node, predicate) {
  const matches = []
  if (predicate(node)) matches.push(node)
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      matches.push(...findNodes(child, predicate))
    }
  }
  return matches
}

function parseAndSanitize(rawHtml) {
  // Construct raw HAST root
  const hastRoot = {
    type: 'root',
    children: [
      {
        type: 'raw',
        value: rawHtml,
      },
    ],
  }

  // Run rehypeRaw
  const rawTransformer = rehypeRaw()
  const rawTree = rawTransformer(hastRoot)

  // Run rehypeSanitize
  const sanitizeTransformer = rehypeSanitize(sanitizeSchema)
  const sanitizedTree = sanitizeTransformer(rawTree)

  return sanitizedTree
}

test('XSS Defense 1: Inline <script> tags are stripped from HAST', () => {
  const tree = parseAndSanitize('Hello <script>alert("xss")</script> World')
  const scriptNodes = findNodes(tree, (n) => n.tagName === 'script')
  assert.equal(scriptNodes.length, 0, 'No script tags should remain in sanitized HAST')
})

test('XSS Defense 2: Event handlers (onerror, onload, onmouseover) are stripped', () => {
  const tree = parseAndSanitize('<img src="x" onerror="alert(1)"> <div onmouseover="alert(2)">Hover</div>')
  const eventNodes = findNodes(tree, (n) => {
    if (!n.properties) return false
    return Object.keys(n.properties).some((prop) => prop.toLowerCase().startsWith('on'))
  })
  assert.equal(eventNodes.length, 0, 'No event handler properties should remain')
})

test('XSS Defense 3: javascript: URI schemes in href and src are stripped', () => {
  const tree = parseAndSanitize('<a href="javascript:alert(1)">Click</a><img src="javascript:alert(2)">')
  const dangerousLinks = findNodes(tree, (n) => {
    const href = n.properties?.href
    const src = n.properties?.src
    return (
      (typeof href === 'string' && href.toLowerCase().includes('javascript:')) ||
      (typeof src === 'string' && src.toLowerCase().includes('javascript:'))
    )
  })
  assert.equal(dangerousLinks.length, 0, 'No javascript: URI schemes should survive')
})

test('XSS Defense 4: Hostile SVG active tags are sanitized', () => {
  const tree = parseAndSanitize('<svg onload="alert(1)"><circle r="10"/></svg>')
  const svgEventNodes = findNodes(tree, (n) => {
    if (!n.properties) return false
    return Object.keys(n.properties).some((prop) => prop.toLowerCase().startsWith('on'))
  })
  assert.equal(svgEventNodes.length, 0, 'SVG event handlers must be stripped')
})

test('XSS Defense 5: Nested malformed tags are sanitized', () => {
  const tree = parseAndSanitize('<<SCRIPT>alert("nested");//<</SCRIPT>')
  const scriptNodes = findNodes(tree, (n) => n.tagName === 'script')
  assert.equal(scriptNodes.length, 0, 'Nested script tags must not be produced')
})
