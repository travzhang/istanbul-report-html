import { CoverageReport } from '../../src'
import { mockCoverage, mockSources } from './mock-data'

export function App() {
  return (
    <CoverageReport coverage={mockCoverage} sources={mockSources} projectName="hono" />
  )
}
