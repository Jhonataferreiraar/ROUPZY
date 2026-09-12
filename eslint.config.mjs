import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
      'next-env.d.ts',
      // Deliberately vulnerable fixtures used only by the SAST training lab.
      'security-lab/**'
  ])
])
