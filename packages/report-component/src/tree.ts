import { addMetrics, computeFileMetrics, emptyMetrics } from './metrics'
import type { CoverageMetrics, FileCoverageData, FileTreeNode } from './types'

export function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/')
}

export function commonDirPrefix(paths: string[]): string {
  if (paths.length === 0) {
    return ''
  }

  const dirParts = paths.map((filePath) => {
    const parts = normalizePath(filePath).split('/').filter(Boolean)
    return parts.slice(0, -1)
  })

  const first = dirParts[0]
  if (first === undefined || first.length === 0) {
    return ''
  }

  let prefix = first
  for (const parts of dirParts.slice(1)) {
    let index = 0
    while (index < prefix.length && index < parts.length && prefix[index] === parts[index]) {
      index += 1
    }
    prefix = prefix.slice(0, index)
  }

  return prefix.join('/')
}

export function rootLabelFromPrefix(prefix: string, fallback: string): string {
  if (prefix === '') {
    return fallback
  }
  const parts = prefix.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? fallback
}

export function toRelPath(filePath: string, prefix: string): string {
  const normalized = normalizePath(filePath)
  if (prefix === '') {
    return normalized.replace(/^\//, '')
  }
  if (normalized === prefix) {
    return ''
  }
  const withSlash = prefix.endsWith('/') ? prefix : `${prefix}/`
  if (normalized.startsWith(withSlash)) {
    return normalized.slice(withSlash.length)
  }
  if (normalized.startsWith(`/${withSlash}`)) {
    return normalized.slice(withSlash.length + 1)
  }
  return normalized.replace(/^\//, '')
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

export function buildFileTree(
  coverage: Record<string, FileCoverageData>,
  prefix: string,
): FileTreeNode {
  const root: FileTreeNode = {
    name: '',
    relPath: '',
    kind: 'dir',
    metrics: emptyMetrics(),
    children: [],
  }

  for (const [coverageKey, data] of Object.entries(coverage)) {
    const absPath = normalizePath(data.path || coverageKey)
    const relPath = toRelPath(absPath, prefix)
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
          relPath: acc,
          kind: isFile ? 'file' : 'dir',
          metrics: isFile ? computeFileMetrics(data) : emptyMetrics(),
          children: [],
          ...(isFile ? { coverageKey } : {}),
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

export function findNode(root: FileTreeNode, relPath: string): FileTreeNode | undefined {
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

export function collectFilesUnder(root: FileTreeNode, relPath: string): FileTreeNode[] {
  const node = findNode(root, relPath)
  if (node === undefined) {
    return []
  }
  return collectFiles(node)
}
