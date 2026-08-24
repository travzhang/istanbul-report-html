import { addMetrics, emptyMetrics, round2 } from './metrics'
import type { CoverageMetrics, DataSourceItem, FileTreeNode } from './types'

export function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/').replace(/^\//, '')
}

function itemMetrics(item: DataSourceItem): CoverageMetrics {
  const tracked = item.tracked
  return {
    tracked,
    covered: item.covered,
    partial: item.partial,
    missed: item.missed,
    pct: tracked === 0 ? 100 : round2((item.covered / tracked) * 100),
  }
}

function sortChildren(node: FileTreeNode): void {
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === 'dir' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  for (const child of node.children) {
    sortChildren(child)
  }
}

function rollupMetrics(node: FileTreeNode): CoverageMetrics {
  if (node.kind === 'file') {
    return node.metrics
  }

  let metrics = emptyMetrics()
  for (const child of node.children) {
    metrics = addMetrics(metrics, rollupMetrics(child))
  }
  node.metrics = metrics
  return metrics
}

export function buildFileTree(items: DataSourceItem[]): FileTreeNode {
  const root: FileTreeNode = {
    name: '',
    path: '',
    kind: 'dir',
    metrics: emptyMetrics(),
    children: [],
  }

  for (const item of items) {
    const relPath = normalizePath(item.path)
    if (relPath === '') {
      continue
    }

    const parts = relPath.split('/').filter(Boolean)
    let current = root
    let acc = ''

    for (let index = 0; index < parts.length; index++) {
      const name = parts[index]
      if (name === undefined) {
        continue
      }
      acc = acc === '' ? name : `${acc}/${name}`
      const isFile = index === parts.length - 1
      let child = current.children.find((node) => node.name === name)
      if (child === undefined) {
        child = {
          name,
          path: acc,
          kind: isFile ? 'file' : 'dir',
          metrics: isFile ? itemMetrics(item) : emptyMetrics(),
          children: [],
        }
        current.children.push(child)
      }
      current = child
    }
  }

  rollupMetrics(root)
  sortChildren(root)
  return root
}

export function findNode(root: FileTreeNode, path: string): FileTreeNode | undefined {
  const relPath = normalizePath(path)
  if (relPath === '') {
    return root
  }

  let current: FileTreeNode | undefined = root
  for (const part of relPath.split('/')) {
    current = current.children.find((node) => node.name === part)
    if (current === undefined) {
      return undefined
    }
  }
  return current
}

export function collectFiles(node: FileTreeNode): FileTreeNode[] {
  if (node.kind === 'file') {
    return [node]
  }
  return node.children.flatMap(collectFiles)
}

export function collectFilesUnder(root: FileTreeNode, path: string): FileTreeNode[] {
  const node = findNode(root, path)
  if (node === undefined) {
    return []
  }
  return collectFiles(node)
}

export function parentPath(path: string): string {
  const normalized = normalizePath(path)
  const index = normalized.lastIndexOf('/')
  return index === -1 ? '' : normalized.slice(0, index)
}
