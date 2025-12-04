import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import nextPlugin from 'eslint-plugin-next'

export default defineConfig([
  {
    ignores: ['.next', 'node_modules', 'dist'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      next: nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
