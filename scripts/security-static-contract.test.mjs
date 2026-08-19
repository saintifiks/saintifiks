import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const REPO_ROOT = process.cwd()

function walkDir(dir, filter = () => true) {
  let results = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== '.next' &&
        file !== '.git' &&
        file !== '.studio-test-dist'
      ) {
        results = results.concat(walkDir(filePath, filter))
      }
    } else if (filter(filePath)) {
      results.push(filePath)
    }
  }
  return results
}

test('Static Contract 1: No SUPABASE_SERVICE_ROLE_KEY in Client Components', () => {
  const codeFiles = walkDir(REPO_ROOT, (f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f))
  const violations = []

  for (const file of codeFiles) {
    const relative = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
    if (relative.startsWith('scripts/') || relative.startsWith('security/')) continue

    const content = fs.readFileSync(file, 'utf8')
    const isClientComponent = /^['"]use client['"]/m.test(content)
    const hasServiceRoleKey = content.includes('SUPABASE_SERVICE_ROLE_KEY')

    if (isClientComponent && hasServiceRoleKey) {
      violations.push(`${relative}: Client Component directly references SUPABASE_SERVICE_ROLE_KEY!`)
    }
  }

  assert.deepEqual(violations, [], `Client component service role key leaks detected:\n${violations.join('\n')}`)
})

test('Static Contract 2: Privileged Administrative Server Actions Call requireAdmin', () => {
  const adminActionFiles = walkDir(path.join(REPO_ROOT, 'app', '(admin)', 'dashboard'), (f) => /actions\.(ts|js)$/.test(f))
  const violations = []

  for (const file of adminActionFiles) {
    const relative = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
    const content = fs.readFileSync(file, 'utf8')
    
    if (/^['"]use server['"]/m.test(content)) {
      if (relative.includes('dashboard/koreksi/actions.ts')) {
        continue
      }
      
      const callsRequireAdmin = /requireAdmin\s*\(/m.test(content) || /isAdmin\s*\(/m.test(content)
      if (!callsRequireAdmin) {
        violations.push(`${relative}: Privileged Server Action module does not invoke requireAdmin() or isAdmin()`)
      }
    }
  }

  assert.deepEqual(violations, [], `Unprotected administrative server actions detected:\n${violations.join('\n')}`)
})

test('Static Contract 3: No dangerouslySetInnerHTML on Untrusted Dynamic Renders', () => {
  const componentFiles = walkDir(REPO_ROOT, (f) => /\.(tsx|jsx)$/.test(f))
  const violations = []

  for (const file of componentFiles) {
    const relative = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
    if (relative === 'app/layout.tsx') continue

    const content = fs.readFileSync(file, 'utf8')
    if (content.includes('dangerouslySetInnerHTML')) {
      violations.push(`${relative}: contains dangerouslySetInnerHTML which is disallowed for untrusted content renderers`)
    }
  }

  assert.deepEqual(violations, [], `Disallowed dangerouslySetInnerHTML usages found:\n${violations.join('\n')}`)
})

test('Static Contract 4: GitHub Actions Workflows Pin Actions to Full 40-Char SHA', () => {
  const workflowDir = path.join(REPO_ROOT, '.github', 'workflows')
  const workflowFiles = walkDir(workflowDir, (f) => /\.(yml|yaml)$/.test(f))
  const violations = []

  for (const file of workflowFiles) {
    const relative = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const usesMatch = /uses:\s*([a-zA-Z0-9_\-\./]+)@([^\s#]+)/.exec(line)
      if (usesMatch) {
        const actionRef = usesMatch[1]
        const versionOrSha = usesMatch[2]
        
        if (actionRef.startsWith('./')) continue

        const is40CharSha = /^[0-9a-fA-F]{40}$/.test(versionOrSha)
        if (!is40CharSha) {
          violations.push(`${relative}:${i + 1}: Action "${actionRef}" uses mutable tag "${versionOrSha}" instead of immutable 40-char SHA`)
        }
      }
    }
  }

  assert.deepEqual(violations, [], `Unpinned GitHub Actions detected:\n${violations.join('\n')}`)
})

test('Static Contract 5: createAdminClient Confined from Public Pages', () => {
  const publicPageFiles = walkDir(path.join(REPO_ROOT, 'app'), (f) => /\.(tsx|jsx|ts|js)$/.test(f))
  const violations = []

  for (const file of publicPageFiles) {
    const relative = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
    // Only check non-admin pages (public routes)
    if (relative.startsWith('app/(admin)/') || relative.startsWith('app/api/')) continue

    const content = fs.readFileSync(file, 'utf8')
    if (content.includes('createAdminClient')) {
      violations.push(`${relative}: Public route directly imports or calls createAdminClient`)
    }
  }

  assert.deepEqual(violations, [], `Forbidden createAdminClient imports found in public pages:\n${violations.join('\n')}`)
})
