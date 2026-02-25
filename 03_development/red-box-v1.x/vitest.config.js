import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true, // Enable CSS processing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.css',
        'src/main.jsx',
        'vite.config.js',
        'vitest.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
