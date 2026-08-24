import { expect, test } from 'vitest'
import { hashToPath, pathToHash } from '../src/hash-route'

test('encodes and decodes hash paths', () => {
  expect(pathToHash('')).toBe('#/')
  expect(pathToHash('src')).toBe('#/src')
  expect(pathToHash('src/utils.ts')).toBe('#/src/utils.ts')
  expect(pathToHash('src/foo bar.ts')).toBe('#/src/foo%20bar.ts')
  expect(pathToHash('src/weird#file.ts')).toBe('#/src/weird%23file.ts')

  expect(hashToPath('')).toBe('')
  expect(hashToPath('#')).toBe('')
  expect(hashToPath('#/')).toBe('')
  expect(hashToPath('#/src/utils.ts')).toBe('src/utils.ts')
  expect(hashToPath('#/src/foo%20bar.ts')).toBe('src/foo bar.ts')
  expect(hashToPath('#/src/weird%23file.ts')).toBe('src/weird#file.ts')
})
