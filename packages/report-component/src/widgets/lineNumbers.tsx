import { renderToStaticMarkup } from 'react-dom/server'

interface LineState {
  lineNumber: number
  hit: number
}

function genBgColor(hit: number): string {
  if (hit > 0) {
    return 'rgb(230, 245, 208)'
  }
  if (hit === 0) {
    return '#f3aeac'
  }
  return 'rgb(234, 234, 234)'
}

function LineNumberWrapper({
  lineNumber,
  line,
  maxHitWidth,
}: {
  lineNumber: number
  line: LineState
  maxHitWidth: number
}) {
  return (
    <div className="line-number-wrapper">
      <span className="line-number">{lineNumber}</span>
      <span
        className="line-coverage"
        style={{
          background: genBgColor(line.hit),
          width: `${maxHitWidth}px`,
        }}
      >
        {line.hit > 0 ? `${line.hit}x` : ''}
      </span>
    </div>
  )
}

export default function lineNumbers(lineNumber: number, linesState: LineState[]): string {
  const line = linesState.find((item) => item.lineNumber === lineNumber) ?? {
    hit: -1,
    lineNumber,
  }

  const maxHit = Math.max(0, ...linesState.map((item) => item.hit))
  const len = maxHit.toString().length
  const maxHitWidth = (len + 2) * 7.2

  return renderToStaticMarkup(
    <LineNumberWrapper lineNumber={lineNumber} line={line} maxHitWidth={maxHitWidth} />,
  )
}
