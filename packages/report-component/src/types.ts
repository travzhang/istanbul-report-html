export interface CoverageLocation {
  line: number
  column: number
}

export interface CoverageRange {
  start: CoverageLocation
  end: CoverageLocation
}

export interface FunctionMapping {
  name?: string
  decl?: CoverageRange
  loc: CoverageRange
}

export interface BranchMapping {
  loc?: CoverageRange
  type: string
  locations: CoverageRange[]
}

/** Shape compatible with istanbul-lib-coverage `FileCoverageData`. */
export interface FileCoverageData {
  path: string
  statementMap: Record<string, CoverageRange>
  fnMap: Record<string, FunctionMapping>
  branchMap: Record<string, BranchMapping>
  s: Record<string, number>
  f: Record<string, number>
  b: Record<string, number[]>
}

export interface CoverageTotals {
  total: number
  covered: number
  skipped: number
  pct: number
}

export interface DataSourceItem {
  path: string
  statements: CoverageTotals
  branches: CoverageTotals
  functions: CoverageTotals
  lines: CoverageTotals
}

export interface FileDataResponse {
  fileCoverage: FileCoverageData
  fileContent: string
}

export interface ReportProps {
  /** 报告名称 */
  name: string
  /** 当前选中的路径 */
  value: string
  dataSource: DataSourceItem[]
  onSelect: (val: string) => Promise<FileDataResponse>
}

export interface ReportAppFile extends FileCoverageData {
  source: string
}

export interface ReportAppProps {
  files: ReportAppFile[]
  /** 插桩工作目录，用于裁剪文件路径前缀 */
  instrumentCwd: string
  generatedAt?: string
  name?: string
  /** 无 hash 时的初始路径，例如 `src/index.ts` */
  defaultValue?: string
  packageName?: string
  packageVersion?: string
  height?: string | number
  showFooter?: boolean
}
