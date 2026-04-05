import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: ['dist', 'coverage', 'src/**/*.{ts,tsx}'],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
