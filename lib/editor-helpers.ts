// Helper functions untuk editor artikel opinions
// Digunakan oleh EditorToolbar dan komponen editor lainnya

/**
 * Sisipkan teks di posisi cursor textarea dengan wrap selection jika ada.
 * Setelah insert, fokus dikembalikan ke textarea dengan posisi cursor yang tepat.
 */
export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  onUpdate: (newContent: string) => void
): void {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const insertText = selectedText || placeholder

  const newContent =
    textarea.value.substring(0, start) +
    before +
    insertText +
    after +
    textarea.value.substring(end)

  onUpdate(newContent)

  setTimeout(() => {
    textarea.focus()
    const newCursorPos = start + before.length + insertText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

/**
 * Sisipkan footnote dengan nomor auto-increment.
 * Hitung footnote terbesar yang sudah ada, lalu tambahkan yang baru.
 */
export function insertFootnote(
  textarea: HTMLTextAreaElement,
  onUpdate: (newContent: string) => void
): void {
  const content = textarea.value
  const cursorPos = textarea.selectionStart

  // Cari nomor footnote terbesar yang sudah ada
  const footnoteRegex = /\[\^(\d+)\]/g
  let maxNum = 0
  let match: RegExpExecArray | null
  while ((match = footnoteRegex.exec(content)) !== null) {
    const num = parseInt(match[1], 10)
    if (num > maxNum) maxNum = num
  }
  const newNum = maxNum + 1

  const refMark = `[^${newNum}]`
  const defMark = `\n[^${newNum}]: `

  const newContent =
    content.substring(0, cursorPos) +
    refMark +
    content.substring(cursorPos) +
    defMark

  onUpdate(newContent)

  // Posisikan cursor setelah definisi footnote di akhir
  setTimeout(() => {
    textarea.focus()
    const newPos = newContent.length
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

/**
 * Generate Markdown tabel template dengan jumlah kolom dan baris tertentu.
 */
export function generateMarkdownTable(cols: number, rows: number): string {
  const header = '| ' + Array.from({ length: cols }, (_, i) => `Kolom ${i + 1}`).join(' | ') + ' |'
  const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |'
  const dataRows = Array.from({ length: rows }, () =>
    '| ' + Array(cols).fill('   ').join(' | ') + ' |'
  )
  return '\n' + [header, separator, ...dataRows].join('\n') + '\n'
}
