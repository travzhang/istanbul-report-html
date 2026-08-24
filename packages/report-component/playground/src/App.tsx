import { useMemo, useState } from 'react'

import { fileCoverageToDataSource, Report } from '../../src'
import { mockCoverage, mockSources } from './mock-data'

export function App() {
  const [value, setValue] = useState('')
  const dataSource = useMemo(() => fileCoverageToDataSource(mockCoverage), [])

  return (
    <Report
      name="hono"
      value={value}
      dataSource={dataSource}
      onSelect={async (val) => {
        setValue(val)
        return { source: mockSources[val] ?? '' }
      }}
    />
  )
}
