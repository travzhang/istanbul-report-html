const STYLE_ID = 'canyonjs-coverage-report-styles'

const css = `
.canyon-report {
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px 28px 40px;
  color: #1f2937;
  background: #fff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

.canyon-report *,
.canyon-report *::before,
.canyon-report *::after {
  box-sizing: border-box;
}

.canyon-report__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  margin-bottom: 12px;
}

.canyon-report__toolbar-left {
  display: flex;
  flex: 1 1 240px;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.canyon-report__segmented {
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.canyon-report__segmented button {
  margin: 0;
  padding: 6px 12px;
  border: none;
  background: #fff;
  color: #111827;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.canyon-report__segmented button + button {
  border-left: 1px solid #d1d5db;
}

.canyon-report__segmented button[aria-pressed='true'] {
  background: #111827;
  color: #fff;
}

.canyon-report__summary {
  overflow: hidden;
  color: #374151;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canyon-report__breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.canyon-report__crumb {
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font: inherit;
  cursor: pointer;
}

.canyon-report__crumb:hover {
  text-decoration: underline;
}

.canyon-report__crumb.is-current {
  color: #111827;
  cursor: default;
  text-decoration: none;
}

.canyon-report__crumb-sep {
  color: #9ca3af;
}

.canyon-report__search {
  display: flex;
  flex: 0 1 280px;
  align-items: center;
  gap: 8px;
  width: 280px;
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
}

.canyon-report__search svg {
  flex-shrink: 0;
  color: #9ca3af;
}

.canyon-report__search input {
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
}

.canyon-report__search input::placeholder {
  color: #9ca3af;
}

.canyon-report__table-wrap {
  overflow-x: auto;
}

.canyon-report__table {
  width: 100%;
  border-collapse: collapse;
}

.canyon-report__table th,
.canyon-report__table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.canyon-report__table th {
  color: #6b7280;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.canyon-report__table th.is-num,
.canyon-report__table td.is-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.canyon-report__sort {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.canyon-report__sort-icon {
  color: #9ca3af;
  font-size: 10px;
}

.canyon-report__sort-icon.is-active {
  color: #111827;
}

.canyon-report__name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.canyon-report__name:hover {
  text-decoration: underline;
}

.canyon-report__folder-icon {
  flex-shrink: 0;
}

.canyon-report__coverage {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.canyon-report__bar {
  flex: 1;
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
  background: #f3f4f6;
}

.canyon-report__bar-fill {
  height: 100%;
  border-radius: 4px;
}

.canyon-report__bar-fill--low {
  background: #ef4444;
}

.canyon-report__bar-fill--medium {
  background: #f59e0b;
}

.canyon-report__bar-fill--high {
  background: #22c55e;
}

.canyon-report__pct {
  width: 4.5em;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.canyon-report__empty {
  margin: 32px 0;
  color: #6b7280;
}

.canyon-report__file-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.canyon-report__back {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font: inherit;
  cursor: pointer;
}

.canyon-report__back:hover {
  background: #f9fafb;
}

.canyon-report__file-path {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canyon-report__source {
  margin: 0;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}

.canyon-report__source-line {
  display: flex;
  min-height: 1.6em;
}

.canyon-report__source-line:hover {
  background: #f3f4f6;
}

.canyon-report__line-no {
  flex-shrink: 0;
  width: 48px;
  padding: 0 8px;
  color: #9ca3af;
  text-align: right;
  user-select: none;
}

.canyon-report__line-text {
  flex: 1;
  padding: 0 12px 0 8px;
  white-space: pre;
}
`

export function injectReportStyles(): void {
  if (typeof document === 'undefined') {
    return
  }
  if (document.getElementById(STYLE_ID)) {
    return
  }
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}
