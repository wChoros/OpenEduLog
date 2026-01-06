import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
   plugins: [reactRouter()],
   test: {
      ...configDefaults,
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./__tests__/setupTests.ts'],
   },
})
