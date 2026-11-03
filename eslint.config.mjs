import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,

  /*
   * Existing ChartBlock implementation constructs JSX inside try/catch.
   * Keep the newer React rule enabled everywhere else.
   */
  {
    files: ['components/artikel/ChartBlock.tsx'],
    rules: {
      'react-hooks/error-boundaries': 'off',
    },
  },

  /*
   * Existing Studio code updates refs during render.
   * Keep the rule enabled for all other source files.
   */
  {
    files: [
      'components/editorial-studio/StudioEditor.tsx',
      'components/editorial-studio/useStudioDraftPersistence.ts',
      'components/editorial-studio/useStudioServerSync.ts',
    ],
    rules: {
      'react-hooks/refs': 'off',
    },
  },

  /*
   * Existing components synchronously update state inside effects.
   * Treat these as scoped migration exceptions, not global exemptions.
   */
  {
    files: [
      'components/bookstore/CartProvider.tsx',
      'components/editorial-studio/StudioEditor.tsx',
      'components/editorial-studio/useStudioDraftPersistence.ts',
      'components/editorial-studio/useStudioServerSync.ts',
      'components/koreksi/KoreksiForm.tsx',
      'components/layout/Drawer.tsx',
      'components/layout/LocationProvider.tsx',
      'components/layout/ThemeToggle.tsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  /*
   * Sistem desain: ikon hanya lewat <Icon> (components/ui). Impor lucide-react langsung masih ada di
   * kode lama; jumlahnya dikunci oleh scripts/design-system-contract.test.mjs (tidak boleh bertambah)
   * dan akan dinaikkan menjadi error setelah migrasi Fase 2.
   */
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    ignores: ['components/ui/Icon.tsx'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: 'lucide-react',
              message: 'Pakai <Icon name="..." /> dari @/components/ui agar ukuran dan goresan seragam.',
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    '.next/**',
    '.studio-test-dist/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])