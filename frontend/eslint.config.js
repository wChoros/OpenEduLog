// eslint.config.js
import react from 'eslint-plugin-react'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
   {
      ignores: ['dist', 'node_modules'],
   },
   {
      files: ['src/**/*.{ts,tsx}'],
      languageOptions: {
         parser: tsParser,
         parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: {
               jsx: true,
            },
         },
      },
      plugins: {
         react,
         '@typescript-eslint': ts,
      },
      rules: {
         // your ESLint rules go here
         '@typescript-eslint/no-unused-vars': [
            'error',
            {
               argsIgnorePattern: '^_',
               varsIgnorePattern: '^_',
               caughtErrorsIgnorePattern: '^_',
            },
         ],
      },
   },
]
