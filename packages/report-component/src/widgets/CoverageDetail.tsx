import { useEffect, useMemo, useRef } from 'react'
import { annotateBranches, annotateFunctions, annotateStatements } from '../helpers/annotate'
import { coreFn } from '../helpers/coreFn'
import { languageFromPath, monaco } from '../monaco'
import type { CoverageAnnotation } from '../helpers/annotate'
import type { FileCoverageData } from '../types'
import lineNumbers from './lineNumbers'

const UNCOVERED_HOVER: Record<CoverageAnnotation['type'], string> = {
  S: 'Statement not covered',
  F: 'Function not covered',
  B: 'Branch not covered',
  I: 'If path not taken',
  E: 'Else path not taken',
}

function hoverMessage(type: CoverageAnnotation['type']): monaco.IMarkdownString {
  return { value: UNCOVERED_HOVER[type] }
}

const emptyCoverage: FileCoverageData = {
  path: '',
  statementMap: {},
  fnMap: {},
  branchMap: {},
  s: {},
  f: {},
  b: {},
}

const CoverageDetail = ({
  source,
  coverage,
}: {
  source: string
  coverage: FileCoverageData
}) => {
  const fileCoverage = coverage.path === '' ? emptyCoverage : coverage
  const { lines } = useMemo(() => coreFn(fileCoverage, source), [fileCoverage, source])
  const ref = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReturnType<typeof monaco.editor.create> | null>(null)

  const linesState = useMemo(
    () =>
      lines.map((line, index) => ({
        lineNumber: index + 1,
        hit: line.executionNumber,
      })),
    [lines],
  )

  const lineNumbersMinChars = useMemo(() => {
    const maxHit = Math.max(0, ...linesState.map((line) => line.hit))
    return maxHit.toString().length + 9
  }, [linesState])

  useEffect(() => {
    const dom = ref.current
    if (dom === null) {
      return
    }

    const editor = monaco.editor.create(dom, {
      value: source,
      language: languageFromPath(fileCoverage.path),
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      lineHeight: 18,
      lineNumbers: (lineNumber: number) => lineNumbers(lineNumber, linesState),
      lineNumbersMinChars,
      readOnly: true,
      folding: false,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      showUnused: false,
      fontSize: 12,
      contextmenu: false,
      automaticLayout: true,
      links: false,
      quickSuggestions: false,
      wordBasedSuggestions: 'off',
    })
    editorRef.current = editor

    const all = [
      ...annotateStatements(fileCoverage, source),
      ...annotateFunctions(fileCoverage, source),
      ...annotateBranches(fileCoverage, source),
    ]

    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    for (const item of all) {
      const hover = hoverMessage(item.type)
      if (item.type === 'S' || item.type === 'F') {
        decorations.push({
          range: new monaco.Range(item.startLine, item.startCol, item.endLine, item.endCol),
          options: {
            isWholeLine: false,
            inlineClassName: 'content-class-no-found',
            hoverMessage: hover,
          },
        })
      } else if (item.type === 'B') {
        decorations.push({
          range: new monaco.Range(item.startLine, item.startCol, item.endLine, item.endCol),
          options: {
            isWholeLine: false,
            inlineClassName: 'content-class-no-found-branch',
            hoverMessage: hover,
          },
        })
      } else if (item.type === 'I') {
        decorations.push({
          range: new monaco.Range(item.startLine, item.startCol, item.startLine, item.startCol),
          options: {
            beforeContentClassName: 'insert-i-decoration',
            hoverMessage: hover,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        })
      } else if (item.type === 'E') {
        decorations.push({
          range: new monaco.Range(item.startLine, item.startCol, item.startLine, item.startCol),
          options: {
            beforeContentClassName: 'insert-e-decoration',
            hoverMessage: hover,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        })
      }
    }

    editor.createDecorationsCollection(decorations)

    return () => {
      editor.dispose()
      editorRef.current = null
    }
  }, [source, fileCoverage, linesState, lineNumbersMinChars])

  return (
    <div className="canyon-coverage-detail-container">
      <div ref={ref} className="canyon-coverage-detail-editor" />
    </div>
  )
}

export default CoverageDetail
