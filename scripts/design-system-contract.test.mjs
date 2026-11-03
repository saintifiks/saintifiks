// Kontrak sistem desain — dijalankan lewat `npm run test:design`.
//
// 1. Tidak boleh ada nama kelas/font lama (primary-dark, font-helvetica, Lora, dst.) — nama itu tidak
//    terdaftar di Tailwind sehingga diam-diam tidak menghasilkan gaya apa pun.
// 2. Setiap kelas warna/font/z-index/bayangan yang dipakai di kode harus menghasilkan aturan CSS nyata.
// 3. "Ratchet": utang desain (impor lucide langsung, hex liar, ukuran px liar) tidak boleh bertambah.
//    Turunkan angka di scripts/design-system-baseline.json bila sudah berkurang (jalankan dengan --update).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'

const root = process.cwd()
const SOURCE_DIRS = ['app', 'components']
const BASELINE_FILE = join(root, 'scripts', 'design-system-baseline.json')
const ICON_FILES = new Set(['components/ui/Icon.tsx'])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts)$/.test(name)) out.push(full)
  }
  return out
}

const files = SOURCE_DIRS.flatMap((d) => walk(join(root, d))).map((full) => ({
  rel: relative(root, full).split(sep).join('/'),
  text: readFileSync(full, 'utf8'),
}))

test('tidak ada kelas atau font lama', () => {
  const legacy =
    /(?<![\w-])(?:(?:text|bg|border|divide|ring|fill|stroke|outline|placeholder:text)-(?:primary-dark|primary-light|accent-(?:blue|red|green))|font-(?:helvetica|libre|lora|body))(?![\w-])/
  const hits = []
  for (const { rel, text } of files) {
    text.split(/\r?\n/).forEach((line, i) => {
      if (legacy.test(line)) hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`)
    })
  }
  assert.deepEqual(hits, [], `Nama kelas lama ditemukan:\n${hits.join('\n')}`)
})

test('setiap kelas desain menghasilkan aturan CSS', () => {
  const dir = mkdtempSync(join(tmpdir(), 'saintifiks-css-'))
  const out = join(dir, 'out.css')
  const run = spawnSync(
    process.execPath,
    [join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js'), '-i', 'app/globals.css', '-o', out],
    { cwd: root, encoding: 'utf8' }
  )
  assert.equal(run.status, 0, run.stderr)
  const css = readFileSync(out, 'utf8')

  const escape = (s) => [...s].map((ch) => (/[\w-]/.test(ch) ? ch : '\\' + ch)).join('')
  const token =
    /["'`\s]((?:[a-z-]+:)*-?(?:text|bg|border|font|ring|fill|stroke|divide|placeholder|shadow|rounded|z)-[\w/.[\]%-]+)/g

  const dead = new Map()
  for (const { rel, text } of files) {
    if (!rel.endsWith('.tsx')) continue
    for (const match of text.matchAll(token)) {
      if (!css.includes('.' + escape(match[1]))) dead.set(match[1], rel)
    }
  }
  const list = [...dead].map(([cls, file]) => `${cls}  (${file})`)
  assert.deepEqual(list, [], `Kelas tanpa aturan CSS:\n${list.join('\n')}`)
})

function measure() {
  let lucide = 0
  let hex = 0
  let arbitraryPx = 0
  for (const { rel, text } of files) {
    if (!ICON_FILES.has(rel) && /from ['"]lucide-react['"]/.test(text)) lucide++
    if (rel.endsWith('.tsx')) {
      hex += (text.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length
      arbitraryPx += (text.match(/text-\[\d+px\]/g) ?? []).length
    }
  }
  return { lucideDirectImports: lucide, hexColors: hex, arbitraryTextPx: arbitraryPx }
}

test('utang desain tidak bertambah (ratchet)', () => {
  const current = measure()
  if (process.argv.includes('--update')) {
    writeFileSync(BASELINE_FILE, JSON.stringify(current, null, 2) + '\n')
    return
  }
  const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
  for (const key of Object.keys(baseline)) {
    assert.ok(
      current[key] <= baseline[key],
      `${key} naik dari ${baseline[key]} menjadi ${current[key]}. Pakai <Icon>/token, bukan impor lucide, hex, atau text-[Npx] baru.`
    )
    if (current[key] < baseline[key]) {
      console.log(`# ${key} turun ke ${current[key]} — jalankan: node scripts/design-system-contract.test.mjs --update`)
    }
  }
})
