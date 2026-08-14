import {
  STUDIO_EVIDENCE_LIMITS,
  createStudioId,
  type StudioChartEvidence,
  type StudioChartSeries,
  type StudioDatasetColumn,
  type StudioDatasetEvidence,
  type StudioIdFactory,
} from './document'

export const STUDIO_CHART_INPUT_LIMITS = {
  series: 6,
  titleLength: 300,
  summaryLength: 2_000,
  seriesLabelLength: 160,
} as const

export type StudioChartType = StudioChartEvidence['type']

export type StudioChartDraftSeries = {
  columnKey: string
  label?: string
}

export type StudioChartDraft = {
  title: string
  summary: string
  type: StudioChartType
  xKey: string
  series: StudioChartDraftSeries[]
}

export type StudioChartModelIssueCode =
  | 'title-required'
  | 'title-too-long'
  | 'summary-required'
  | 'summary-too-long'
  | 'unsafe-control-character'
  | 'unsupported-chart-type'
  | 'dataset-mismatch'
  | 'x-column-required'
  | 'x-column-missing'
  | 'x-type-unsupported'
  | 'series-required'
  | 'too-many-series'
  | 'series-column-required'
  | 'series-column-missing'
  | 'series-type-unsupported'
  | 'duplicate-series-column'
  | 'series-label-required'
  | 'series-label-too-long'
  | 'duplicate-series-label'
  | 'series-unit-missing'
  | 'mixed-series-units'
  | 'duplicate-series-id'

export type StudioChartModelIssue = {
  code: StudioChartModelIssueCode
  message: string
  path: string
  columnKey?: string
}

export type StudioValidatedChartSeries = {
  column: StudioDatasetColumn
  label: string
}

export type StudioValidatedChartDraft = {
  title: string
  summary: string
  type: StudioChartType
  xColumn: StudioDatasetColumn
  series: StudioValidatedChartSeries[]
  seriesUnit: string
}

export type StudioChartDraftValidationResult =
  | { ok: true; model: StudioValidatedChartDraft }
  | { ok: false; issues: StudioChartModelIssue[] }

export type StudioChartBuildOptions = {
  existingChart?: StudioChartEvidence
  idFactory?: StudioIdFactory
}

export type StudioChartBuildResult =
  | { ok: true; chart: StudioChartEvidence }
  | { ok: false; issues: StudioChartModelIssue[] }

export type StudioResolvedChartSeries = {
  series: StudioChartSeries
  column: StudioDatasetColumn
}

export type StudioResolvedChartModel = {
  chart: StudioChartEvidence
  dataset: StudioDatasetEvidence
  xColumn: StudioDatasetColumn
  series: StudioResolvedChartSeries[]
  seriesUnit: string
}

export type StudioChartResolutionResult =
  | { ok: true; model: StudioResolvedChartModel }
  | { ok: false; issues: StudioChartModelIssue[] }

export type StudioDatasetChartDependency = {
  chartId: string
  chartTitle: string
}

export type StudioDatasetColumnChartDependency = StudioDatasetChartDependency & {
  roles: Array<'x' | 'series'>
}

const CHART_TYPES = new Set<StudioChartType>(['line', 'bar', 'scatter'])
const UNSAFE_CONTROL_CHARACTER = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function normalizedIdentity(value: string) {
  return value.trim().normalize('NFKC').toLocaleLowerCase('id-ID')
}

function pushTextIssues(
  issues: StudioChartModelIssue[],
  value: string,
  path: string,
  label: string,
  requiredCode: StudioChartModelIssueCode,
  tooLongCode: StudioChartModelIssueCode,
  maxLength: number
) {
  if (value.length === 0) {
    issues.push({ code: requiredCode, message: `${label} wajib diisi.`, path })
  } else if (value.length > maxLength) {
    issues.push({
      code: tooLongCode,
      message: `${label} maksimal ${maxLength} karakter.`,
      path,
    })
  }
  if (UNSAFE_CONTROL_CHARACTER.test(value)) {
    issues.push({
      code: 'unsafe-control-character',
      message: `${label} mengandung karakter kontrol yang tidak didukung.`,
      path,
    })
  }
}

function validateChartConfiguration(
  dataset: StudioDatasetEvidence,
  draft: StudioChartDraft,
  maxSeries: number
): StudioChartDraftValidationResult {
  const issues: StudioChartModelIssue[] = []
  const title = draft.title.trim()
  const summary = draft.summary.trim()
  const xKey = draft.xKey.trim()
  const columns = new Map(dataset.columns.map((column) => [column.key, column]))

  pushTextIssues(
    issues,
    title,
    'title',
    'Judul grafik',
    'title-required',
    'title-too-long',
    STUDIO_CHART_INPUT_LIMITS.titleLength
  )
  pushTextIssues(
    issues,
    summary,
    'summary',
    'Ringkasan grafik',
    'summary-required',
    'summary-too-long',
    STUDIO_CHART_INPUT_LIMITS.summaryLength
  )

  if (!CHART_TYPES.has(draft.type)) {
    issues.push({
      code: 'unsupported-chart-type',
      message: 'Grafik hanya mendukung line, bar, atau scatter.',
      path: 'type',
    })
  }

  if (!xKey) {
    issues.push({
      code: 'x-column-required',
      message: 'Kolom sumbu X wajib dipilih.',
      path: 'xKey',
    })
  }
  const xColumn = columns.get(xKey)
  if (xKey && !xColumn) {
    issues.push({
      code: 'x-column-missing',
      message: `Kolom sumbu X tidak ditemukan dalam dataset: ${xKey}.`,
      path: 'xKey',
      columnKey: xKey,
    })
  } else if (
    xColumn
    && (
      xColumn.dataType === 'boolean'
      || (draft.type === 'scatter' && xColumn.dataType !== 'number')
    )
  ) {
    issues.push({
      code: 'x-type-unsupported',
      message: draft.type === 'scatter'
        ? 'Scatter memerlukan kolom angka pada sumbu X.'
        : 'Sumbu X line atau bar hanya menerima teks, tanggal, atau angka.',
      path: 'xKey',
      columnKey: xColumn.key,
    })
  }

  if (!Array.isArray(draft.series) || draft.series.length === 0) {
    issues.push({
      code: 'series-required',
      message: 'Grafik wajib memiliki sedikitnya satu seri.',
      path: 'series',
    })
  } else if (draft.series.length > maxSeries) {
    issues.push({
      code: 'too-many-series',
      message: `Grafik ini maksimal memiliki ${maxSeries} seri.`,
      path: 'series',
    })
  }

  const selectedColumnKeys = new Set<string>()
  const labelIdentities = new Map<string, number>()
  const unitIdentities = new Set<string>()
  const validatedSeries: StudioValidatedChartSeries[] = []

  if (Array.isArray(draft.series)) {
    draft.series.forEach((series, index) => {
      const basePath = `series[${index}]`
      const columnKey = series.columnKey.trim()
      if (!columnKey) {
        issues.push({
          code: 'series-column-required',
          message: 'Kolom seri wajib dipilih.',
          path: `${basePath}.columnKey`,
        })
        return
      }

      if (selectedColumnKeys.has(columnKey)) {
        issues.push({
          code: 'duplicate-series-column',
          message: `Kolom ${columnKey} dipilih lebih dari sekali sebagai seri.`,
          path: `${basePath}.columnKey`,
          columnKey,
        })
      }
      selectedColumnKeys.add(columnKey)

      const column = columns.get(columnKey)
      if (!column) {
        issues.push({
          code: 'series-column-missing',
          message: `Kolom seri tidak ditemukan dalam dataset: ${columnKey}.`,
          path: `${basePath}.columnKey`,
          columnKey,
        })
        return
      }
      if (column.dataType !== 'number') {
        issues.push({
          code: 'series-type-unsupported',
          message: `Seri “${column.label}” harus menggunakan kolom angka.`,
          path: `${basePath}.columnKey`,
          columnKey,
        })
      }

      const label = series.label?.trim() || column.label.trim()
      pushTextIssues(
        issues,
        label,
        `${basePath}.label`,
        'Label seri',
        'series-label-required',
        'series-label-too-long',
        STUDIO_CHART_INPUT_LIMITS.seriesLabelLength
      )
      const labelIdentity = normalizedIdentity(label)
      const firstSeries = labelIdentities.get(labelIdentity)
      if (firstSeries !== undefined) {
        issues.push({
          code: 'duplicate-series-label',
          message: `Label seri sama dengan seri ${firstSeries + 1}.`,
          path: `${basePath}.label`,
          columnKey,
        })
      } else {
        labelIdentities.set(labelIdentity, index)
      }

      const unit = column.unit?.trim() ?? ''
      if (!unit) {
        issues.push({
          code: 'series-unit-missing',
          message: `Kolom seri “${column.label}” belum memiliki unit.`,
          path: `${basePath}.columnKey`,
          columnKey,
        })
      } else {
        unitIdentities.add(normalizedIdentity(unit))
      }

      validatedSeries.push({ column, label })
    })
  }

  if (unitIdentities.size > 1) {
    issues.push({
      code: 'mixed-series-units',
      message: 'Semua seri harus memakai unit yang sama; grafik dua sumbu tidak didukung.',
      path: 'series',
    })
  }

  if (issues.length > 0 || !xColumn) return { ok: false, issues }
  return {
    ok: true,
    model: {
      title,
      summary,
      type: draft.type,
      xColumn,
      series: validatedSeries,
      seriesUnit: validatedSeries[0].column.unit?.trim() ?? '',
    },
  }
}

export function validateStudioChartDraft(
  dataset: StudioDatasetEvidence,
  draft: StudioChartDraft
): StudioChartDraftValidationResult {
  return validateChartConfiguration(dataset, draft, STUDIO_CHART_INPUT_LIMITS.series)
}

export function buildStudioChartEvidence(
  dataset: StudioDatasetEvidence,
  draft: StudioChartDraft,
  options: StudioChartBuildOptions = {}
): StudioChartBuildResult {
  const validated = validateStudioChartDraft(dataset, draft)
  if (!validated.ok) return validated

  const idFactory = options.idFactory ?? createStudioId
  const existingSeriesIds = options.existingChart?.datasetId === dataset.id
    ? new Map(options.existingChart.series.map((series) => [series.columnKey, series.id]))
    : new Map<string, string>()
  const series: StudioChartSeries[] = validated.model.series.map((resolvedSeries) => {
    const id = existingSeriesIds.get(resolvedSeries.column.key) ?? idFactory('series')
    return {
      id,
      columnKey: resolvedSeries.column.key,
      label: resolvedSeries.label,
    }
  })

  const duplicateIdIssues: StudioChartModelIssue[] = []
  const checkedSeriesIds = new Set<string>()
  series.forEach((item, index) => {
    if (checkedSeriesIds.has(item.id)) {
      duplicateIdIssues.push({
        code: 'duplicate-series-id',
        message: 'Pembuat ID menghasilkan ID seri duplikat.',
        path: `series[${index}].id`,
        columnKey: item.columnKey,
      })
    }
    checkedSeriesIds.add(item.id)
  })
  if (duplicateIdIssues.length > 0) return { ok: false, issues: duplicateIdIssues }

  return {
    ok: true,
    chart: {
      id: options.existingChart?.id ?? idFactory('chart'),
      title: validated.model.title,
      summary: validated.model.summary,
      datasetId: dataset.id,
      type: validated.model.type,
      xKey: validated.model.xColumn.key,
      series,
    },
  }
}

export function resolveStudioChartModel(
  dataset: StudioDatasetEvidence,
  chart: StudioChartEvidence
): StudioChartResolutionResult {
  if (chart.datasetId !== dataset.id) {
    return {
      ok: false,
      issues: [{
        code: 'dataset-mismatch',
        message: `Grafik tidak terhubung ke dataset ${dataset.id}.`,
        path: 'datasetId',
      }],
    }
  }

  const validated = validateChartConfiguration(
    dataset,
    {
      title: chart.title,
      summary: chart.summary,
      type: chart.type,
      xKey: chart.xKey,
      series: chart.series.map((series) => ({
        columnKey: series.columnKey,
        label: series.label,
      })),
    },
    STUDIO_EVIDENCE_LIMITS.seriesPerChart
  )
  if (!validated.ok) return validated

  return {
    ok: true,
    model: {
      chart,
      dataset,
      xColumn: validated.model.xColumn,
      series: validated.model.series.map((resolvedSeries, index) => ({
        series: chart.series[index],
        column: resolvedSeries.column,
      })),
      seriesUnit: validated.model.seriesUnit,
    },
  }
}

export function findStudioDatasetChartDependencies(
  charts: StudioChartEvidence[],
  datasetId: string
): StudioDatasetChartDependency[] {
  return charts
    .filter((chart) => chart.datasetId === datasetId)
    .map((chart) => ({ chartId: chart.id, chartTitle: chart.title }))
}

export function findStudioDatasetColumnChartDependencies(
  charts: StudioChartEvidence[],
  datasetId: string,
  columnKey: string
): StudioDatasetColumnChartDependency[] {
  return charts.flatMap((chart) => {
    if (chart.datasetId !== datasetId) return []
    const roles: Array<'x' | 'series'> = []
    if (chart.xKey === columnKey) roles.push('x')
    if (chart.series.some((series) => series.columnKey === columnKey)) roles.push('series')
    return roles.length > 0
      ? [{ chartId: chart.id, chartTitle: chart.title, roles }]
      : []
  })
}
