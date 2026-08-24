import { expect, test } from 'vitest'
import { filesToDataSource } from '../src/helpers/summary'
import { coverageLines, makeFileCoverage } from '../src/make-coverage'
import { cwdBaseName, resolveSource, toAbsolutePath, toRelativePath } from '../src/paths'

test('strips instrumentCwd prefix like canyon', () => {
  const cwd = '/Users/foo/hono'
  expect(toRelativePath('/Users/foo/hono/src/index.ts', cwd)).toBe('src/index.ts')
  expect(toAbsolutePath('src/index.ts', cwd)).toBe('/Users/foo/hono/src/index.ts')
  expect(cwdBaseName(cwd)).toBe('hono')
})

test('resolveSource looks up by absolute or relative key', () => {
  const sources = {
    '/Users/foo/hono/src/index.ts': 'export const a = 1\n',
  }
  expect(resolveSource(sources, 'src/index.ts', '/Users/foo/hono')).toBe('export const a = 1\n')
  expect(resolveSource({ 'src/index.ts': 'ok' }, 'src/index.ts', '')).toBe('ok')
})

test('filesToDataSource keeps coverage file paths', () => {
  const coverage = {
    '/Users/foo/hono/src/index.ts': makeFileCoverage('/Users/foo/hono/src/index.ts', coverageLines(2, 0)),
    '/Users/foo/hono/build/index.js': makeFileCoverage('/Users/foo/hono/build/index.js', coverageLines(1, 1)),
  }
  const items = filesToDataSource(Object.values(coverage)).map((item) =>
    toRelativePath(item.path, '/Users/foo/hono'),
  )
  expect(items.sort()).toEqual(['build/index.js', 'src/index.ts'])
})
