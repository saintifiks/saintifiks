// Helper aktif untuk editor artikel Opinions.

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
