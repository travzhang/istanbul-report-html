import { expect, test } from 'vitest'
import { coverageLines, makeFileCoverage } from '../src/make-coverage'
import { fileCoverageToDataSource } from '../src/metrics'
import {
  cwdBaseName,
  resolveInstrumentCwd,
  resolveSource,
  toAbsolutePath,
  toRelativePath,
} from '../src/paths'

test('walks up until a single common directory remains', () => {
  expect(
    resolveInstrumentCwd([
      '/Users/foo/hono/src/index.ts',
      '/Users/foo/hono/src/utils.ts',
      '/Users/foo/hono/build/index.js',
    ]),
  ).toBe('/Users/foo/hono')

  expect(
    resolveInstrumentCwd(['/Users/foo/hono/src/a.ts', '/Users/foo/hono/src/b.ts']),
  ).toBe('/Users/foo/hono/src')

  expect(resolveInstrumentCwd(['src/index.ts', 'lib/parse.ts'])).toBe('')
})

test('converts between relative UI paths and absolute instrument paths', () => {
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

test('fileCoverageToDataSource emits paths relative to instrumentCwd', () => {
  const coverage = {
    '/Users/foo/hono/src/index.ts': makeFileCoverage('/Users/foo/hono/src/index.ts', coverageLines(2, 0)),
    '/Users/foo/hono/build/index.js': makeFileCoverage('/Users/foo/hono/build/index.js', coverageLines(1, 1)),
  }
  const items = fileCoverageToDataSource(coverage)
  expect(items.map((item) => item.path).sort()).toEqual(['build/index.js', 'src/index.ts'])
})
