import { useMemo, useState } from 'react'

import { FileSourceView } from './FileSourceView'
import { coverageLevel } from './metrics'
import { injectReportStyles } from './styles'
import {
  buildFileTree,
  collectFiles,
  collectFilesUnder,
  commonDirPrefix,
  findNode,
  normalizePath,
  rootLabelFromPrefix,
} from './tree'
import type { CoverageReportProps, FileTreeNode } from './types'

type ViewMode = 'tree' | 'list'
type SortKey = 'name' | 'tracked' | 'covered' | 'partial' | 'missed' | 'pct'
type SortDir = 'asc' | 'desc'

const DEFAULT_WATERMARKS: [number, number] = [50, 80]

function FolderIcon() {
  return (
    <svg className="canyon-report__folder-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="#3b82f6"
        d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H7.84a.25.25 0 0 1-.2-.1l-.9-1.2A1.75 1.75 0 0 0 5.36 2H1.75Z"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 10.5 14 14M6.75 11.5a4.75 4.75 0 1 1 0-9.5 4.75 4.75 0 0 1 0 9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

function matchesQuery(relPath: string, query: string): boolean {
  if (query === '') {
    return true
  }
  return relPath.toLowerCase().includes(query.toLowerCase())
}

function sortRows(rows: FileTreeNode[], key: SortKey, dir: SortDir): FileTreeNode[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    if (key === 'name') {
      if (a.kind !== b.kind) {
        return a.kind === 'dir' ? -1 : 1
      }
      return sign * a.name.localeCompare(b.name)
    }
    return sign * (a.metrics[key] - b.metrics[key])
  })
}

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  numeric,
  onSort,
}: {
  label: string
  column: SortKey
  sortKey: SortKey
  sortDir: SortDir
  numeric?: boolean
  onSort: (column: SortKey) => void
}) {
  const active = sortKey === column
  const icon = !active ? '↕' : sortDir === 'asc' ? '↑' : '↓'

  return (
    <th {...(numeric ? { className: 'is-num' } : {})}>
      <button type="button" className="canyon-report__sort" onClick={() => onSort(column)}>
        {label}
        <span className={`canyon-report__sort-icon${active ? ' is-active' : ''}`}>{icon}</span>
      </button>
    </th>
  )
}

function Breadcrumb({
  rootLabel,
  currentDir,
  onNavigate,
}: {
  rootLabel: string
  currentDir: string
  onNavigate: (relPath: string) => void
}) {
  const parts = currentDir === '' ? [] : currentDir.split('/')

  return (
    <nav className="canyon-report__breadcrumb" aria-label="Current path">
      <button
        type="button"
        className={`canyon-report__crumb${currentDir === '' ? ' is-current' : ''}`}
        onClick={() => onNavigate('')}
      >
        {rootLabel}
      </button>
      {parts.map((part, index) => {
        const path = parts.slice(0, index + 1).join('/')
        const isCurrent = index === parts.length - 1
        return (
          <span key={path}>
            <span className="canyon-report__crumb-sep"> / </span>
            <button
              type="button"
              className={`canyon-report__crumb${isCurrent ? ' is-current' : ''}`}
              onClick={() => onNavigate(path)}
            >
              {part}
            </button>
          </span>
        )
      })}
    </nav>
  )
}

export function CoverageReport({
  coverage,
  sources = {},
  projectName,
  watermarks = DEFAULT_WATERMARKS,
}: CoverageReportProps) {
  injectReportStyles()
  const [view, setView] = useState<ViewMode>('tree')
  const [query, setQuery] = useState('')
  const [currentDir, setCurrentDir] = useState('')
  const [selectedFile, setSelectedFile] = useState<{ coverageKey: string; relPath: string } | null>(
    null,
  )
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filePaths = useMemo(
    () => Object.entries(coverage).map(([key, data]) => normalizePath(data.path || key)),
    [coverage],
  )
  const prefix = useMemo(() => commonDirPrefix(filePaths), [filePaths])
  const rootLabel = projectName ?? rootLabelFromPrefix(prefix, 'Coverage')
  const tree = useMemo(() => buildFileTree(coverage, prefix), [coverage, prefix])

  const rows = useMemo(() => {
    const trimmed = query.trim()
    if (view === 'list') {
      return collectFiles(tree).filter((node) => matchesQuery(node.relPath, trimmed))
    }
    if (trimmed !== '') {
      return collectFilesUnder(tree, currentDir).filter((node) => matchesQuery(node.relPath, trimmed))
    }
    return findNode(tree, currentDir)?.children ?? []
  }, [tree, view, query, currentDir])

  const sortedRows = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])
  const totalFiles = useMemo(() => collectFiles(tree).length, [tree])

  const handleSort = (column: SortKey) => {
    if (sortKey === column) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(column)
    setSortDir(column === 'name' ? 'asc' : 'desc')
  }

  const openNode = (node: FileTreeNode) => {
    if (node.kind === 'dir') {
      setCurrentDir(node.relPath)
      setSelectedFile(null)
      return
    }
    if (node.coverageKey === undefined) {
      return
    }
    setSelectedFile({ coverageKey: node.coverageKey, relPath: node.relPath })
  }

  if (selectedFile !== null) {
    return (
      <div className="canyon-report">
        <FileSourceView
          filePath={selectedFile.relPath}
          source={sources[selectedFile.coverageKey]}
          onBack={() => setSelectedFile(null)}
        />
      </div>
    )
  }

  return (
    <div className="canyon-report">
      <div className="canyon-report__toolbar">
        <div className="canyon-report__toolbar-left">
          <div className="canyon-report__segmented" role="group" aria-label="View mode">
            <button type="button" aria-pressed={view === 'tree'} onClick={() => setView('tree')}>
              Code tree
            </button>
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              File list
            </button>
          </div>
          {view === 'tree' ? (
            <Breadcrumb rootLabel={rootLabel} currentDir={currentDir} onNavigate={setCurrentDir} />
          ) : (
            <div className="canyon-report__summary">
              {sortedRows.length.toLocaleString('en-US')} total files
              <span> {rootLabel}</span>
            </div>
          )}
        </div>
        <div className="canyon-report__search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            placeholder="Search for files"
            aria-label="Search for files"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {sortedRows.length === 0 ? (
        <p className="canyon-report__empty">
          {totalFiles === 0 ? 'No coverage files.' : 'No files match this search.'}
        </p>
      ) : (
        <div className="canyon-report__table-wrap">
          <table className="canyon-report__table">
            <thead>
              <tr>
                <SortHeader label="Files" column="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader
                  label="Tracked lines"
                  column="tracked"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  numeric
                  onSort={handleSort}
                />
                <SortHeader
                  label="Covered"
                  column="covered"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  numeric
                  onSort={handleSort}
                />
                <SortHeader
                  label="Partial"
                  column="partial"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  numeric
                  onSort={handleSort}
                />
                <SortHeader
                  label="Missed"
                  column="missed"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  numeric
                  onSort={handleSort}
                />
                <th>Coverage %</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((node) => {
                const level = coverageLevel(node.metrics.pct, watermarks)
                const label = view === 'list' || query.trim() !== '' ? node.relPath : node.name
                return (
                  <tr key={`${node.kind}:${node.relPath}`}>
                    <td>
                      <button type="button" className="canyon-report__name" onClick={() => openNode(node)}>
                        {node.kind === 'dir' ? <FolderIcon /> : null}
                        {label}
                      </button>
                    </td>
                    <td className="is-num">{formatCount(node.metrics.tracked)}</td>
                    <td className="is-num">{formatCount(node.metrics.covered)}</td>
                    <td className="is-num">{formatCount(node.metrics.partial)}</td>
                    <td className="is-num">{formatCount(node.metrics.missed)}</td>
                    <td>
                      <div className="canyon-report__coverage">
                        <div className="canyon-report__bar" aria-hidden="true">
                          <div
                            className={`canyon-report__bar-fill canyon-report__bar-fill--${level}`}
                            style={{ width: `${Math.min(node.metrics.pct, 100)}%` }}
                          />
                        </div>
                        <span className="canyon-report__pct">{node.metrics.pct.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
