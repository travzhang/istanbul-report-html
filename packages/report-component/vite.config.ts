/// <reference types="vitest/config" />
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)
const monacoCss = join(dirname(require.resolve('monaco-editor')), '../../min/vs/editor/editor.main.css')

export default defineConfig({
  root: './playground',
  plugins: [react()],
  resolve: {
    alias: {
      'monaco-editor-css': monacoCss,
    },
  },
  optimizeDeps: {
    include: [
      '@ant-design/icons',
      'antd',
      'monaco-editor/editor/editor.api',
      'monaco-editor/editor/contrib/hover/browser/hoverContribution',
      'monaco-editor/languages/definitions/css/register',
      'monaco-editor/languages/definitions/html/register',
      'monaco-editor/languages/definitions/javascript/register',
      'monaco-editor/languages/definitions/typescript/register',
      'react-dom/server',
      'react-highlight-words',
    ],
  },
  test: {
    root: '.',
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
