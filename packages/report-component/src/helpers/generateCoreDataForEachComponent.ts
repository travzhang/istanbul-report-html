import type { DataSourceItem } from '../types'
import { genSummaryTreeItem } from './summary'

function matchesKeywords(item: { path: string }, keywords: string): boolean {
  if (keywords === '') {
    return true
  }
  return item.path.toLowerCase().includes(keywords.toLowerCase())
}

function underPath(item: { path: string }, startValue: string): boolean {
  if (startValue === '') {
    return true
  }
  return item.path === startValue || item.path.startsWith(`${startValue}/`)
}

export function generateCoreDataForEachComponent({
  dataSource,
  filenameKeywords,
  value,
}: {
  dataSource: DataSourceItem[]
  filenameKeywords: string
  value: string
}): {
  treeDataSource: DataSourceItem[]
  rootDataSource: DataSourceItem
  listDataSource: DataSourceItem[]
} {
  const listDataSource = dataSource.filter(
    (item) => underPath(item, value) && matchesKeywords(item, filenameKeywords),
  )
  const tree = genSummaryTreeItem(value, listDataSource)
  return {
    treeDataSource: tree.children,
    rootDataSource: {
      path: tree.path,
      ...tree.summary,
    },
    listDataSource,
  }
}
