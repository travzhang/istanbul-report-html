import { useState } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Report } from '../src'
import { filesToDataSource } from '../src/helpers/summary'
import { coverageLines, makeFileCoverage } from '../src/make-coverage'
import type { FileCoverageData } from '../src/types'

const coverage: Record<string, FileCoverageData> = {
  'src/index.ts': makeFileCoverage('src/index.ts', coverageLines(8, 2)),
  'src/utils.ts': makeFileCoverage('src/utils.ts', coverageLines(5, 5)),
  'lib/parse.ts': makeFileCoverage('lib/parse.ts', coverageLines(3, 1)),
}

const sources: Record<string, string> = {
  'src/index.ts': 'export const value = 1\n',
  'src/utils.ts': 'export function util() {}\n',
  'lib/parse.ts': 'export function parse() {}\n',
}

const emptyCoverage: FileCoverageData = {
  path: '',
  statementMap: {},
  fnMap: {},
  branchMap: {},
  s: {},
  f: {},
  b: {},
}

const dataSource = filesToDataSource(Object.values(coverage))

function Harness() {
  const [value, setValue] = useState('')
  return (
    <Report
      name="hono"
      value={value}
      dataSource={dataSource}
      onSelect={async (val) => {
        setValue(val)
        return {
          fileCoverage: coverage[val] ?? emptyCoverage,
          fileContent: sources[val] ?? '',
        }
      }}
    />
  )
}

test('tree, list, search, and file source', async () => {
  const screen = await render(<Harness />)

  await expect.element(screen.getByText('src', { exact: true })).toBeInTheDocument()
  await expect.element(screen.getByText('lib', { exact: true })).toBeInTheDocument()

  await screen.getByText('src', { exact: true }).click()
  await expect.element(screen.getByText('index.ts')).toBeInTheDocument()
  await expect.element(screen.getByText('utils.ts')).toBeInTheDocument()

  await screen.getByText('hono', { exact: true }).click()
  await screen.getByText('File List').click()
  await expect.element(screen.getByText('src/index.ts')).toBeInTheDocument()
  await expect.element(screen.getByText(/3 Total Files/)).toBeInTheDocument()

  await screen.getByPlaceholder('Enter the file path to search').fill('utils')
  await expect.element(screen.getByText('src/utils.ts')).toBeInTheDocument()
  await expect.element(screen.getByText('src/index.ts')).not.toBeInTheDocument()

  await screen.getByText('src/utils.ts').click()
  await expect.element(screen.getByText('src/utils.ts')).toBeInTheDocument()
  await expect.poll(() => document.querySelector('.monaco-editor')).not.toBeNull()
})
