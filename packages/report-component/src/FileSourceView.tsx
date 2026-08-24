import { useEffect, useRef } from "react"
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/basic-languages/monaco.contribution.js'
interface FileSourceViewProps {
  filePath: string
  source: string | undefined
  loading: boolean
  onBack: () => void
}

export function FileSourceView({ filePath, source, loading, onBack }: FileSourceViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (ref.current !== null && ref.current.innerHTML === "") {
      editorRef.current = monaco.editor.create(ref.current, {
        value: source ?? "",
        language: "typescript",
      })
    }
  }, [source, loading])

  return (
    <div className="canyon-report__file">
      <div className="canyon-report__file-header">
        <button type="button" className="canyon-report__back" onClick={onBack}>
          Back
        </button>
        <span className="canyon-report__file-path">{filePath}</span>
      </div>
      {loading ? (
        <p className="canyon-report__empty">Loading…</p>
      ) : source === undefined ? (
        <p className="canyon-report__empty">Source not available.</p>
      ) : (
        <pre className="canyon-report__source">
          <div ref={ref} style={{ height: '500px', width: '500px' }} />
        </pre>
      )}
    </div>
  )
}
