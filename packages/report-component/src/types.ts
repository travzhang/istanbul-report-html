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
  path: string
  kind: FileKind
  metrics: CoverageMetrics
  children: FileTreeNode[]
}

export interface DataSourceItem {
  /** 文件路径 */
  path: string
  tracked: number
  covered: number
  partial: number
  missed: number
}

export interface FileDataResponse {
  /** 文件源码 */
  source: string
}

export interface ReportProps {
  /** 报告名称 */
  name: string
  /** 当前选中的路径 */
  value: string
  dataSource: DataSourceItem[]
  onSelect: (val: string) => Promise<FileDataResponse>
}

/** Shape compatible with istanbul-lib-coverage `FileCoverageData`. */
export interface CoverageLocation {
  line: number
  column: number
}

export interface CoverageRange {
  start: CoverageLocation
  end: CoverageLocation
}

export interface FileCoverageData {
  path: string
  statementMap: Record<string, CoverageRange>
  fnMap: Record<string, { loc: CoverageRange }>
  branchMap: Record<string, { loc: CoverageRange }>
  s: Record<string, number>
  f: Record<string, number>
  b: Record<string, number[]>
}
