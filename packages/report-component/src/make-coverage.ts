import type { FileCoverageData } from './types'

export function makeFileCoverage(
  filePath: string,
  lines: readonly (readonly [line: number, hits: number])[],
  branches: readonly (readonly [line: number, hits: readonly number[]])[] = [],
): FileCoverageData {
  const statementMap: FileCoverageData['statementMap'] = {}
  const s: FileCoverageData['s'] = {}
  for (const [index, entry] of lines.entries()) {
    const line = entry[0]
    const hits = entry[1]
    statementMap[String(index)] = {
      start: { line, column: 0 },
      end: { line, column: 80 },
    }
    s[String(index)] = hits
  }

  const branchMap: FileCoverageData['branchMap'] = {}
  const b: FileCoverageData['b'] = {}
  for (const [index, entry] of branches.entries()) {
    const line = entry[0]
    const hits = entry[1]
    branchMap[String(index)] = {
      loc: {
        start: { line, column: 0 },
        end: { line, column: 80 },
      },
    }
    b[String(index)] = [...hits]
  }

  return {
    path: filePath,
    statementMap,
    fnMap: {},
    branchMap,
    s,
    f: {},
    b,
  }
}

/** `covered` then `missed` consecutive executable lines starting at 1. */
export function coverageLines(
  covered: number,
  missed: number,
): Array<readonly [number, number]> {
  const lines: Array<readonly [number, number]> = []
  let line = 1
  for (let i = 0; i < covered; i++) {
    lines.push([line, 1])
    line += 1
  }
  for (let i = 0; i < missed; i++) {
    lines.push([line, 0])
    line += 1
  }
  return lines
}
