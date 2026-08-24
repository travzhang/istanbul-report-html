import { ConfigProvider, Spin } from 'antd'
import { type FC, useEffect, useId, useMemo, useRef, useState } from 'react'
import RIf from './components/RIf'
import { generateCoreDataForEachComponent } from './helpers/generateCoreDataForEachComponent'
import type { FileCoverageData, ReportProps } from './types'
import CoverageDetail from './widgets/CoverageDetail'
import SummaryHeader from './widgets/SummaryHeader'
import SummaryList from './widgets/SummaryList'
import SummaryTree from './widgets/SummaryTree'
import TopControl from './widgets/TopControl'

const emptyFileCoverage: FileCoverageData = {
  path: '',
  statementMap: {},
  fnMap: {},
  branchMap: {},
  s: {},
  f: {},
  b: {},
}

export const Report: FC<ReportProps> = ({ value, name, dataSource, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [filenameKeywords, setFilenameKeywords] = useState('')
  const [showMode, setShowMode] = useState('tree')
  const [fileCoverage, setFileCoverage] = useState<FileCoverageData>(emptyFileCoverage)
  const [fileContent, setFileContent] = useState('')
  const rootId = useId().replaceAll(':', '')
  const rootClassName = `report-scope-${rootId} canyonjs-report-html`
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const requestSelect = (path: string) => {
    void onSelectRef.current(path)
  }

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    void onSelectRef
      .current(value)
      .then((res) => {
        if (cancelled) {
          return
        }
        setFileContent(res.fileContent)
        setFileCoverage(res.fileCoverage)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [value])

  const isFile = useMemo(
    () => dataSource.some((item) => item.path === value),
    [dataSource, value],
  )
  const mode = isFile ? 'file' : showMode
  const isFileDataReady = isFile && !isLoading

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(
    () =>
      generateCoreDataForEachComponent({
        dataSource,
        filenameKeywords,
        value,
      }),
    [dataSource, value, filenameKeywords],
  )

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071c2',
          borderRadius: 2,
        },
      }}
    >
      <div className={rootClassName}>
        <TopControl
          filenameKeywords={filenameKeywords}
          showMode={showMode}
          onChangeShowMode={(val) => {
            setShowMode(val)
          }}
          total={listDataSource.length}
          onChangeKeywords={(val) => {
            setFilenameKeywords(val)
          }}
        />
        <SummaryHeader reportName={name} data={rootDataSource} value={value} onSelect={requestSelect} />

        <RIf condition={mode === 'file'}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Spin spinning={!isFileDataReady} classNames={{ root: 'canyon-coverage-detail-spin-wrapper' }}>
              <RIf condition={isFileDataReady}>
                <CoverageDetail source={fileContent} coverage={fileCoverage} />
              </RIf>
            </Spin>
          </div>
        </RIf>

        {mode === 'tree' && <SummaryTree dataSource={treeDataSource} onSelect={requestSelect} />}
        {mode === 'list' && (
          <SummaryList
            dataSource={listDataSource}
            onSelect={requestSelect}
            filenameKeywords={filenameKeywords}
          />
        )}
      </div>
    </ConfigProvider>
  )
}

export default Report
export type { ReportProps }
