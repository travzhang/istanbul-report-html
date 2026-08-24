interface FileSourceViewProps {
  filePath: string
  source: string | undefined
  onBack: () => void
}

export function FileSourceView({ filePath, source, onBack }: FileSourceViewProps) {
  const lines = source === undefined ? [] : source.split('\n')

  return (
    <div className="canyon-report__file">
      <div className="canyon-report__file-header">
        <button type="button" className="canyon-report__back" onClick={onBack}>
          Back
        </button>
        <span className="canyon-report__file-path">{filePath}</span>
      </div>
      {source === undefined ? (
        <p className="canyon-report__empty">Source not available.</p>
      ) : (
        <pre className="canyon-report__source">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="canyon-report__source-line">
                <span className="canyon-report__line-no">{index + 1}</span>
                <span className="canyon-report__line-text">{line === '' ? ' ' : line}</span>
              </div>
            ))}
          </code>
        </pre>
      )}
    </div>
  )
}
