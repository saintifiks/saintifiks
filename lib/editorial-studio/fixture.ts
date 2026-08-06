import type { StudioDocument } from './document'

export const editorialStudioFixture: StudioDocument = {
  schemaVersion: 1,
  documentId: 'doc-studio-poc',
  root: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { id: 'paragraph-opening', schemaVersion: 1 },
        content: [
          { type: 'text', text: 'Editor yang baik membuat penulis fokus pada argumen, bukan pada format. ' },
          {
            type: 'text',
            text: 'Bukti tetap dekat dengan klaim',
            marks: [{ type: 'bold' }],
          },
          { type: 'text', text: ', sementara kerumitan teknis bekerja di belakang layar ' },
          {
            type: 'citation',
            attrs: {
              id: 'citation-opening',
              schemaVersion: 1,
              sourceId: 'source-poc-1',
              label: 'Sumber 1',
              locator: 'bagian 2',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'heading',
        attrs: { id: 'heading-principle', schemaVersion: 1, level: 2 },
        content: [{ type: 'text', text: 'Prinsip kerja' }],
      },
      {
        type: 'callout',
        attrs: { id: 'callout-method', schemaVersion: 1, tone: 'method' },
        content: [
          {
            type: 'paragraph',
            attrs: { id: 'paragraph-callout', schemaVersion: 1 },
            content: [
              {
                type: 'text',
                text: 'Setiap blok memiliki identitas stabil agar komentar, sumber, revisi, dan koreksi tidak mudah terlepas.',
              },
            ],
          },
        ],
      },
      {
        type: 'bulletList',
        attrs: { id: 'list-principles', schemaVersion: 1 },
        content: [
          {
            type: 'listItem',
            attrs: { id: 'list-item-evidence', schemaVersion: 1 },
            content: [
              {
                type: 'paragraph',
                attrs: { id: 'paragraph-list-evidence', schemaVersion: 1 },
                content: [{ type: 'text', text: 'Sumber dapat ditelusuri kembali.' }],
              },
            ],
          },
          {
            type: 'listItem',
            attrs: { id: 'list-item-recovery', schemaVersion: 1 },
            content: [
              {
                type: 'paragraph',
                attrs: { id: 'paragraph-list-recovery', schemaVersion: 1 },
                content: [{ type: 'text', text: 'Isi dapat dipulihkan tanpa menebak-nebak versi.' }],
              },
            ],
          },
        ],
      },
      {
        type: 'figure',
        attrs: {
          id: 'figure-flow',
          schemaVersion: 1,
          assetId: 'asset-editor-flow',
          alt: 'Alur dari bukti menuju klaim dan publikasi',
          caption: 'Media pada POC dirujuk melalui assetId, bukan URL bebas.',
          credit: 'Saintifiks',
        },
      },
      {
        type: 'table',
        attrs: { id: 'table-contract', schemaVersion: 1 },
        content: [
          {
            type: 'tableRow',
            attrs: { id: 'table-row-head', schemaVersion: 1 },
            content: [
              {
                type: 'tableHeader',
                attrs: { id: 'table-head-layer', schemaVersion: 1 },
                content: [
                  {
                    type: 'paragraph',
                    attrs: { id: 'paragraph-table-head-layer', schemaVersion: 1 },
                    content: [{ type: 'text', text: 'Lapisan' }],
                  },
                ],
              },
              {
                type: 'tableHeader',
                attrs: { id: 'table-head-duty', schemaVersion: 1 },
                content: [
                  {
                    type: 'paragraph',
                    attrs: { id: 'paragraph-table-head-duty', schemaVersion: 1 },
                    content: [{ type: 'text', text: 'Tanggung jawab' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            attrs: { id: 'table-row-body', schemaVersion: 1 },
            content: [
              {
                type: 'tableCell',
                attrs: { id: 'table-cell-editor', schemaVersion: 1 },
                content: [
                  {
                    type: 'paragraph',
                    attrs: { id: 'paragraph-table-editor', schemaVersion: 1 },
                    content: [{ type: 'text', text: 'Editor' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                attrs: { id: 'table-cell-json', schemaVersion: 1 },
                content: [
                  {
                    type: 'paragraph',
                    attrs: { id: 'paragraph-table-json', schemaVersion: 1 },
                    content: [{ type: 'text', text: 'Menghasilkan JSON yang sah.' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'chartReference',
        attrs: {
          id: 'chart-reference-poc',
          schemaVersion: 1,
          chartId: 'chart-poc-1',
          title: 'Contoh rujukan visualisasi data',
        },
      },
      {
        type: 'datasetReference',
        attrs: {
          id: 'dataset-reference-poc',
          schemaVersion: 1,
          datasetId: 'dataset-poc-1',
          label: 'Dataset landasan artikel',
        },
      },
      {
        type: 'equation',
        attrs: {
          id: 'equation-poc',
          schemaVersion: 1,
          latex: 'R = \\frac{klaim\\ terverifikasi}{seluruh\\ klaim}',
          label: 'Rasio verifikasi',
        },
      },
      {
        type: 'paragraph',
        attrs: { id: 'paragraph-closing', schemaVersion: 1 },
        content: [
          { type: 'text', text: 'Catatan metodologis dapat ditambahkan tanpa memutus alur baca' },
          {
            type: 'footnote',
            attrs: {
              id: 'footnote-poc',
              schemaVersion: 1,
              note: 'Catatan ini tetap menjadi bagian terstruktur dari dokumen.',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  },
}
