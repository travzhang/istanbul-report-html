import type { CoverageMetrics, DataSourceItem, FileCoverageData } from './types'
import { resolveInstrumentCwd, toRelativePath } from './paths'

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function emptyMetrics(): CoverageMetrics {
  return { tracked: 0, covered: 0, partial: 0, missed: 0, pct: 100 }
}

export function addMetrics(a: CoverageMetrics, b: CoverageMetrics): CoverageMetrics {
  const tracked = a.tracked + b.tracked
  const covered = a.covered + b.covered
  const partial = a.partial + b.partial
  const missed = a.missed + b.missed
  return {
    tracked,
    covered,
    partial,
    missed,
    pct: tracked === 0 ? 100 : round2((covered / tracked) * 100),
  }
}

export function computeFileMetrics(coverage: FileCoverageData): CoverageMetrics {
  const lineHits = new Map<number, number>()

  for (const [id, range] of Object.entries(coverage.statementMap)) {
    const hits = coverage.s[id] ?? 0
    const start = range.start.line
    const end = range.end.line
    for (let line = start; line <= end; line++) {
      const prev = lineHits.get(line)
      if (prev === undefined || hits > prev) {
        lineHits.set(line, hits)
      }
    }
  }

  const partialLines = new Set<number>()
  for (const [id, branch] of Object.entries(coverage.branchMap)) {
    const hits = coverage.b[id] ?? []
    if (hits.length === 0) {
      continue
    }
    const hasHit = hits.some((count) => count > 0)
    const hasMiss = hits.some((count) => count === 0)
    if (hasHit && hasMiss) {
      partialLines.add(branch.loc.start.line)
    }
  }

  let covered = 0
  let partial = 0
  let missed = 0

  for (const [line, hits] of lineHits) {
    if (hits > 0 && partialLines.has(line)) {
      partial += 1
    } else if (hits > 0) {
      covered += 1
    } else {
      missed += 1
    }
  }

  const tracked = covered + partial + missed
  return {
    tracked,
    covered,
    partial,
    missed,
    pct: tracked === 0 ? 100 : round2((covered / tracked) * 100),
  }
}

export function fileCoverageToDataSource(
  coverage: Record<string, FileCoverageData>,
  instrumentCwd?: string,
): DataSourceItem[] {
  const absPaths = Object.entries(coverage).map(([key, data]) => data.path || key)
  const cwd = instrumentCwd ?? resolveInstrumentCwd(absPaths)

  return Object.entries(coverage).map(([key, data]) => {
    const metrics = computeFileMetrics(data)
    return {
      path: toRelativePath(data.path || key, cwd),
      tracked: metrics.tracked,
      covered: metrics.covered,
      partial: metrics.partial,
      missed: metrics.missed,
    }
  })
}

export function coverageLevel(
  pct: number,
  watermarks: [number, number],
): 'low' | 'medium' | 'high' {
  const [low, high] = watermarks
  if (pct < low) {
    return 'low'
  }
  if (pct < high) {
    return 'medium'
  }
  return 'high'
}
