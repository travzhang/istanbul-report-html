import { ReportApp } from '../../src'
import type { ReportAppFile } from '../../src'
import { mockCoverage, mockSources } from './mock-data'

const files: ReportAppFile[] = Object.entries(mockCoverage).map(([path, coverage]) => ({
  ...coverage,
  path,
  source: mockSources[path] ?? '',
}))

export function App() {
  return <ReportApp files={files} instrumentCwd="" name="hono" showFooter={false} />
}
