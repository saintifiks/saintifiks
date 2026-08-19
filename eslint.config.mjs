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

  globalIgnores([
    '.next/**',
    '.studio-test-dist/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])