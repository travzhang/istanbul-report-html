import { afterEach, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { ReportApp } from '../src'
import { coverageLines, makeFileCoverage } from '../src/make-coverage'
import type { ReportAppFile } from '../src/types'

const files: ReportAppFile[] = [
  {
    ...makeFileCoverage('src/index.ts', coverageLines(8, 2)),
    source: 'export const value = 1\n',
  },
  {
    ...makeFileCoverage('src/utils.ts', coverageLines(5, 5)),
    source: 'export function util() {}\n',
  },
]

afterEach(() => {
  window.location.hash = ''
})

test('hash follows the selected path', async () => {
  window.location.hash = ''
  const screen = await render(
    <ReportApp files={files} instrumentCwd="" name="hono" showFooter={false} />,
  )

  await screen.getByText('src', { exact: true }).click()
  await expect.poll(() => window.location.hash).toBe('#/src')
  await expect.element(screen.getByText('utils.ts')).toBeInTheDocument()

  await screen.getByText('utils.ts').click()
  await expect.poll(() => window.location.hash).toBe('#/src/utils.ts')
  await expect.poll(() => document.querySelector('.monaco-editor')).not.toBeNull()
})

test('opens the path from the initial hash', async () => {
  window.location.hash = '#/src/utils.ts'
  const screen = await render(
    <ReportApp files={files} instrumentCwd="" name="hono" showFooter={false} />,
  )

  await expect.element(screen.getByText('src/utils.ts')).toBeInTheDocument()
  await expect.poll(() => document.querySelector('.monaco-editor')).not.toBeNull()
})
