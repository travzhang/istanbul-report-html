import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { CoverageReport } from '../src'
import { coverageLines, makeFileCoverage } from '../src/make-coverage'

const coverage = {
  'src/index.ts': makeFileCoverage('src/index.ts', coverageLines(8, 2)),
  'src/utils.ts': makeFileCoverage('src/utils.ts', coverageLines(5, 5)),
  'lib/parse.ts': makeFileCoverage('lib/parse.ts', coverageLines(3, 1)),
}

const sources = {
  'src/index.ts': 'export const value = 1\n',
  'src/utils.ts': 'export function util() {}\n',
  'lib/parse.ts': 'export function parse() {}\n',
}

test('tree, list, search, and file source', async () => {
  const screen = await render(
    <CoverageReport coverage={coverage} sources={sources} projectName="hono" />,
  )

  await expect.element(screen.getByRole('button', { name: 'src' })).toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'lib' })).toBeInTheDocument()

  await screen.getByRole('button', { name: 'src' }).click()
  await expect.element(screen.getByRole('button', { name: 'index.ts' })).toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'utils.ts' })).toBeInTheDocument()

  await screen.getByRole('button', { name: 'File list' }).click()
  await expect.element(screen.getByRole('button', { name: 'src/index.ts' })).toBeInTheDocument()
  await expect.element(screen.getByText(/3 total files/)).toBeInTheDocument()

  await screen.getByPlaceholder('Search for files').fill('utils')
  await expect.element(screen.getByRole('button', { name: 'src/utils.ts' })).toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'src/index.ts' })).not.toBeInTheDocument()

  await screen.getByRole('button', { name: 'src/utils.ts' }).click()
  await expect.element(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  await expect.element(screen.getByText('src/utils.ts')).toBeInTheDocument()
  await expect.element(screen.getByText('export function util() {}')).toBeInTheDocument()
})
