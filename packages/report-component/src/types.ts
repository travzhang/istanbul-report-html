export interface CoverageLocation {
  line: number
  column: number
}

export interface CoverageRange {
  start: CoverageLocation
  end: CoverageLocation
}

/** Shape compatible with istanbul-lib-coverage `FileCoverageData`. */
export interface FileCoverageData {
  path: string
  statementMap: Record<string, CoverageRange>
  fnMap: Record<string, { loc: CoverageRange }>
  branchMap: Record<string, { loc: CoverageRange }>
  s: Record<string, number>
  f: Record<string, number>
  b: Record<string, number[]>
}

export interface CoverageMetrics {
  tracked: number
  covered: number
  partial: number
  missed: number
  pct: number
}

export type FileKind = 'file' | 'dir'

export interface FileTreeNode {
  name: string
  relPath: string
  kind: FileKind
  metrics: CoverageMetrics
  children: FileTreeNode[]
  coverageKey?: string
}

export interface CoverageReportProps {
  coverage: Record<string, FileCoverageData>
  sources?: Record<string, string>
  projectName?: string
  /** Low / high percentage thresholds, default `[50, 80]`. */
  watermarks?: [number, number]
}
