import {
  createStudioId,
  type StudioDatasetColumn,
  type StudioDatasetRow,
  type StudioDatasetValue,
  type StudioIdFactory,
} from './document'

export const STUDIO_TABULAR_INPUT_LIMITS = {
  rows: 250,
  columns: 12,
  headerLength: 160,
  unitLength: 80,
  cellLength: 500,
} as const

export type StudioNumberLocale = 'id-ID' | 'en-US'
export type StudioTabularDataType = StudioDatasetColumn['dataType']

export type StudioTabularInputIssueCode =
  | 'empty-input'
  | 'malformed-quotes'
  | 'too-many-columns'
  | 'too-many-rows'
  | 'missing-header'
  | 'empty-header'
  | 'duplicate-header'
  | 'header-too-long'
  | 'cell-too-long'
  | 'unsafe-control-character'
  | 'uneven-row'
  | 'column-settings-mismatch'
  | 'invalid-column-type'
  | 'empty-label'
  | 'label-too-long'
  | 'unit-too-long'
  | 'duplicate-label'
  | 'invalid-number'
  | 'unsafe-integer'
  | 'invalid-date'
  | 'invalid-boolean'
  | 'duplicate-row-id'

export type StudioTabularInputIssue = {
  code: StudioTabularInputIssueCode
  message: string
  row?: number
  column?: number
}

export type StudioParsedTabularInput = {
  headers: string[]
  rows: string[][]
}

export type StudioTabularParseResult =
  | { ok: true; table: StudioParsedTabularInput }
  | { ok: false; issues: StudioTabularInputIssue[] }

export type StudioTabularValueResult =
  | { ok: true; value: StudioDatasetValue }
  | { ok: false; issue: StudioTabularInputIssue }

export type StudioTabularColumnSetting = {
  dataType: StudioTabularDataType
  label?: string
  unit?: string | null
}

export type StudioDatasetTableBuildResult =
  | { ok: true; columns: StudioDatasetColumn[]; rows: StudioDatasetRow[] }
  | { ok: false; issues: StudioTabularInputIssue[] }

const TABULAR_DATA_TYPES = new Set<StudioTabularDataType>([
  'string',
  'number',
  'boolean',
  'date',
])
const UNSAFE_CONTROL_CHARACTER = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function pushCell(row: string[], field: string) {
  row.push(field)
}

function parseTsvRecords(input: string):
  | { ok: true; rows: string[][] }
  | { ok: false; issue: StudioTabularInputIssue } {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let quoteClosed = false
  let endedWithRowBreak = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
          quoteClosed = true
        }
      } else if (character === '\r') {
        field += '\n'
        if (input[index + 1] === '\n') index += 1
      } else {
        field += character
      }
      endedWithRowBreak = false
      continue
    }

    if (quoteClosed) {
      if (character !== '\t' && character !== '\r' && character !== '\n') {
        return {
          ok: false,
          issue: {
            code: 'malformed-quotes',
            message: 'Setelah kutip penutup hanya boleh ada pemisah kolom atau baris.',
            row: rows.length + 1,
            column: row.length + 1,
          },
        }
      }
      quoteClosed = false
    }

    if (character === '"') {
      if (field.length > 0) {
        return {
          ok: false,
          issue: {
            code: 'malformed-quotes',
            message: 'Kutip pembuka harus berada di awal sel.',
            row: rows.length + 1,
            column: row.length + 1,
          },
        }
      }
      inQuotes = true
      endedWithRowBreak = false
      continue
    }

    if (character === '\t') {
      pushCell(row, field)
      field = ''
      endedWithRowBreak = false
      continue
    }

    if (character === '\r' || character === '\n') {
      pushCell(row, field)
      field = ''
      rows.push(row)
      row = []
      if (character === '\r' && input[index + 1] === '\n') index += 1
      endedWithRowBreak = true
      continue
    }

    field += character
    endedWithRowBreak = false
  }

  if (inQuotes) {
    return {
      ok: false,
      issue: {
        code: 'malformed-quotes',
        message: 'Kutip pembuka tidak memiliki kutip penutup.',
        row: rows.length + 1,
        column: row.length + 1,
      },
    }
  }

  row.push(field)
  rows.push(row)
  if (endedWithRowBreak) rows.pop()

  return { ok: true, rows }
}

function normalizedLabelIdentity(label: string) {
  return label.normalize('NFKC').toLocaleLowerCase('id-ID')
}

function validateParsedRecords(records: string[][]): StudioTabularParseResult {
  const issues: StudioTabularInputIssue[] = []
  const rawHeaders = records[0]

  if (!rawHeaders || rawHeaders.length === 0) {
    return {
      ok: false,
      issues: [{ code: 'missing-header', message: 'Baris header wajib tersedia.' }],
    }
  }

  if (rawHeaders.length > STUDIO_TABULAR_INPUT_LIMITS.columns) {
    issues.push({
      code: 'too-many-columns',
      message: `Maksimal ${STUDIO_TABULAR_INPUT_LIMITS.columns} kolom dapat diproses dalam sekali tempel.`,
      row: 1,
    })
  }

  const headers = rawHeaders.map((header) => header.trim())
  const headerIdentities = new Map<string, number>()
  headers.forEach((header, columnIndex) => {
    const column = columnIndex + 1
    if (header.length === 0) {
      issues.push({
        code: 'empty-header',
        message: 'Nama setiap kolom wajib diisi.',
        row: 1,
        column,
      })
      return
    }
    if (header.length > STUDIO_TABULAR_INPUT_LIMITS.headerLength) {
      issues.push({
        code: 'header-too-long',
        message: `Nama kolom maksimal ${STUDIO_TABULAR_INPUT_LIMITS.headerLength} karakter.`,
        row: 1,
        column,
      })
    }
    if (UNSAFE_CONTROL_CHARACTER.test(header)) {
      issues.push({
        code: 'unsafe-control-character',
        message: 'Nama kolom mengandung karakter kontrol yang tidak didukung.',
        row: 1,
        column,
      })
    }

    const identity = normalizedLabelIdentity(header)
    const firstColumn = headerIdentities.get(identity)
    if (firstColumn !== undefined) {
      issues.push({
        code: 'duplicate-header',
        message: `Nama kolom sama dengan kolom ${firstColumn}.`,
        row: 1,
        column,
      })
    } else {
      headerIdentities.set(identity, column)
    }
  })

  const dataRows = records.slice(1)
  if (dataRows.length > STUDIO_TABULAR_INPUT_LIMITS.rows) {
    issues.push({
      code: 'too-many-rows',
      message: `Maksimal ${STUDIO_TABULAR_INPUT_LIMITS.rows} baris data dapat diproses dalam sekali tempel.`,
    })
  }

  dataRows.forEach((dataRow, rowIndex) => {
    const row = rowIndex + 2
    if (dataRow.length !== rawHeaders.length) {
      issues.push({
        code: 'uneven-row',
        message: `Baris memiliki ${dataRow.length} sel; seharusnya ${rawHeaders.length}.`,
        row,
      })
    }

    dataRow.forEach((cell, columnIndex) => {
      const column = columnIndex + 1
      if (cell.length > STUDIO_TABULAR_INPUT_LIMITS.cellLength) {
        issues.push({
          code: 'cell-too-long',
          message: `Isi sel maksimal ${STUDIO_TABULAR_INPUT_LIMITS.cellLength} karakter.`,
          row,
          column,
        })
      }
      if (UNSAFE_CONTROL_CHARACTER.test(cell)) {
        issues.push({
          code: 'unsafe-control-character',
          message: 'Sel mengandung karakter kontrol yang tidak didukung.',
          row,
          column,
        })
      }
    })
  })

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, table: { headers, rows: dataRows } }
}

export function parseStudioTabularInput(rawInput: string): StudioTabularParseResult {
  const input = rawInput.charCodeAt(0) === 0xFEFF ? rawInput.slice(1) : rawInput
  if (input.trim().length === 0) {
    return {
      ok: false,
      issues: [{ code: 'empty-input', message: 'Data tempel masih kosong.' }],
    }
  }

  const parsed = parseTsvRecords(input)
  if (!parsed.ok) return { ok: false, issues: [parsed.issue] }
  return validateParsedRecords(parsed.rows)
}

function parseLocalizedNumber(
  input: string,
  locale: StudioNumberLocale
): StudioTabularValueResult {
  const numberPattern = locale === 'id-ID'
    ? /^[+-]?(?:\d+|\d+,\d+|\d{1,3}(?:\.\d{3})+(?:,\d+)?)$/
    : /^[+-]?(?:\d+|\d+\.\d+|\d{1,3}(?:,\d{3})+(?:\.\d+)?)$/

  if (!numberPattern.test(input)) {
    return {
      ok: false,
      issue: {
        code: 'invalid-number',
        message: locale === 'id-ID'
          ? 'Angka harus memakai format id-ID, misalnya 1.234,56.'
          : 'Angka harus memakai format en-US, misalnya 1,234.56.',
      },
    }
  }

  const normalized = locale === 'id-ID'
    ? input.replace(/\./g, '').replace(',', '.')
    : input.replace(/,/g, '')
  const value = Number(normalized)
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      issue: { code: 'invalid-number', message: 'Angka berada di luar rentang yang didukung.' },
    }
  }

  if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
    return {
      ok: false,
      issue: {
        code: 'unsafe-integer',
        message: 'Bilangan bulat terlalu besar untuk disimpan tepat; pilih tipe teks.',
      },
    }
  }

  return { ok: true, value }
}

function normalizedIsoDate(input: string): string | null {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
  const localMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input)
  const match = isoMatch ?? localMatch
  if (!match) return null

  const year = Number(isoMatch ? match[1] : match[3])
  const month = Number(match[2])
  const day = Number(isoMatch ? match[3] : match[1])
  if (year < 1 || month < 1 || month > 12 || day < 1) return null

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  if (day > daysInMonth) return null
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function convertStudioTabularValue(
  rawValue: string,
  dataType: StudioTabularDataType,
  numberLocale: StudioNumberLocale
): StudioTabularValueResult {
  const input = rawValue.trim()
  if (input.length === 0) return { ok: true, value: null }

  if (dataType === 'string') return { ok: true, value: input }
  if (dataType === 'number') return parseLocalizedNumber(input, numberLocale)

  if (dataType === 'boolean') {
    const normalized = input.toLocaleLowerCase('id-ID')
    if (normalized === 'ya' || normalized === 'true') return { ok: true, value: true }
    if (normalized === 'tidak' || normalized === 'false') return { ok: true, value: false }
    return {
      ok: false,
      issue: {
        code: 'invalid-boolean',
        message: 'Boolean hanya menerima ya/tidak atau true/false.',
      },
    }
  }

  const date = normalizedIsoDate(input)
  if (date) return { ok: true, value: date }
  return {
    ok: false,
    issue: {
      code: 'invalid-date',
      message: 'Tanggal harus memakai YYYY-MM-DD atau DD/MM/YYYY dan merupakan tanggal yang valid.',
    },
  }
}

export function createStudioDatasetColumnKey(label: string, existingKeys: Set<string>) {
  const normalized = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  const prefixed = /^[A-Za-z]/.test(normalized) ? normalized : `column-${normalized}`
  const base = (prefixed === 'column-' ? 'column' : prefixed).slice(0, 64).replace(/-+$/g, '')

  let key = base
  let suffix = 2
  while (existingKeys.has(key)) {
    const suffixText = `-${suffix}`
    key = `${base.slice(0, 64 - suffixText.length).replace(/-+$/g, '')}${suffixText}`
    suffix += 1
  }
  existingKeys.add(key)
  return key
}

export function buildStudioDatasetTable(
  table: StudioParsedTabularInput,
  columnSettings: StudioTabularColumnSetting[],
  numberLocale: StudioNumberLocale,
  idFactory: StudioIdFactory = createStudioId
): StudioDatasetTableBuildResult {
  const validatedTable = validateParsedRecords([table.headers, ...table.rows])
  if (!validatedTable.ok) return validatedTable
  const normalizedTable = validatedTable.table

  if (columnSettings.length !== normalizedTable.headers.length) {
    return {
      ok: false,
      issues: [{
        code: 'column-settings-mismatch',
        message: 'Setiap kolom wajib memiliki satu pengaturan tipe.',
      }],
    }
  }

  const issues: StudioTabularInputIssue[] = []
  const labels = columnSettings.map((setting, index) => (
    setting.label ?? normalizedTable.headers[index]
  ).trim())
  const labelIdentities = new Map<string, number>()
  const keys = new Set<string>()
  const columns: StudioDatasetColumn[] = columnSettings.map((setting, index) => {
    const label = labels[index]
    const column = index + 1
    const dataType = TABULAR_DATA_TYPES.has(setting.dataType) ? setting.dataType : 'string'
    if (dataType !== setting.dataType) {
      issues.push({
        code: 'invalid-column-type',
        message: 'Tipe kolom tidak didukung.',
        column,
      })
    }
    if (label.length === 0) {
      issues.push({
        code: 'empty-label',
        message: 'Label kolom wajib diisi.',
        column,
      })
    } else if (label.length > STUDIO_TABULAR_INPUT_LIMITS.headerLength) {
      issues.push({
        code: 'label-too-long',
        message: `Label kolom maksimal ${STUDIO_TABULAR_INPUT_LIMITS.headerLength} karakter.`,
        column,
      })
    }
    if (UNSAFE_CONTROL_CHARACTER.test(label)) {
      issues.push({
        code: 'unsafe-control-character',
        message: 'Label kolom mengandung karakter kontrol yang tidak didukung.',
        column,
      })
    }

    const identity = normalizedLabelIdentity(label)
    const firstColumn = labelIdentities.get(identity)
    if (firstColumn !== undefined) {
      issues.push({
        code: 'duplicate-label',
        message: `Label kolom sama dengan kolom ${firstColumn}.`,
        column,
      })
    } else {
      labelIdentities.set(identity, column)
    }

    const unit = setting.unit?.trim() || null
    if (unit && unit.length > STUDIO_TABULAR_INPUT_LIMITS.unitLength) {
      issues.push({
        code: 'unit-too-long',
        message: `Unit maksimal ${STUDIO_TABULAR_INPUT_LIMITS.unitLength} karakter.`,
        column,
      })
    }
    if (unit && UNSAFE_CONTROL_CHARACTER.test(unit)) {
      issues.push({
        code: 'unsafe-control-character',
        message: 'Unit mengandung karakter kontrol yang tidak didukung.',
        column,
      })
    }

    return {
      key: createStudioDatasetColumnKey(label || `column-${column}`, keys),
      label,
      dataType,
      unit,
    }
  })

  const rows: StudioDatasetRow[] = []
  const rowIds = new Set<string>()
  normalizedTable.rows.forEach((inputRow, rowIndex) => {
    const rowNumber = rowIndex + 2
    const values: Record<string, StudioDatasetValue> = {}
    columns.forEach((column, columnIndex) => {
      const converted = convertStudioTabularValue(
        inputRow[columnIndex] ?? '',
        column.dataType,
        numberLocale
      )
      if (converted.ok) {
        values[column.key] = converted.value
      } else {
        issues.push({ ...converted.issue, row: rowNumber, column: columnIndex + 1 })
      }
    })

    const id = idFactory('row')
    if (rowIds.has(id)) {
      issues.push({
        code: 'duplicate-row-id',
        message: 'Pembuat ID menghasilkan ID baris duplikat.',
        row: rowNumber,
      })
    }
    rowIds.add(id)
    rows.push({ id, values })
  })

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, columns, rows }
}
