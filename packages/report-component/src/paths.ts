/** POSIX-ify slashes; keep a leading `/` so absolute Unix paths stay absolute. */
export function posixify(filePath: string): string {
  return filePath.replaceAll('\\', '/')
}

export function dirName(filePath: string): string {
  const normalized = posixify(filePath).replace(/\/+$/, '')
  if (normalized === '' || normalized === '/') {
    return ''
  }
  const index = normalized.lastIndexOf('/')
  if (index === -1) {
    return ''
  }
  if (index === 0) {
    return '/'
  }
  return normalized.slice(0, index)
}

/**
 * Walk up from each file's parent until every path shares a single directory.
 * That directory is `instrumentCwd`; UI paths are relative to it.
 */
export function resolveInstrumentCwd(filePaths: readonly string[]): string {
  if (filePaths.length === 0) {
    return ''
  }

  let dirs = filePaths.map((filePath) => dirName(filePath))
  if (dirs.some((dir) => dir === '')) {
    return ''
  }

  while (new Set(dirs).size > 1) {
    const next = dirs.map(dirName)
    if (next.some((dir) => dir === '')) {
      return ''
    }
    dirs = next
  }

  return dirs[0] ?? ''
}

export function toRelativePath(filePath: string, instrumentCwd: string): string {
  const abs = posixify(filePath)
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (cwd === '' || cwd === '/') {
    return abs.replace(/^\//, '')
  }
  if (abs === cwd) {
    return ''
  }
  const prefix = `${cwd}/`
  if (abs.startsWith(prefix)) {
    return abs.slice(prefix.length)
  }
  return abs.replace(/^\//, '')
}

export function toAbsolutePath(relPath: string, instrumentCwd: string): string {
  const rel = posixify(relPath).replace(/^\//, '')
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (cwd === '') {
    return rel
  }
  if (rel === '') {
    return cwd
  }
  if (cwd === '/') {
    return `/${rel}`
  }
  return `${cwd}/${rel}`
}

export function cwdBaseName(instrumentCwd: string): string {
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (cwd === '' || cwd === '/') {
    return 'Coverage'
  }
  const parts = cwd.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? 'Coverage'
}

export function resolveSource(
  sources: Record<string, string>,
  relPath: string,
  instrumentCwd: string,
): string {
  const abs = toAbsolutePath(relPath, instrumentCwd)
  const direct = sources[abs] ?? sources[relPath]
  if (direct !== undefined) {
    return direct
  }

  const needle = posixify(relPath)
  if (needle === '') {
    return ''
  }

  for (const [key, src] of Object.entries(sources)) {
    const normalized = posixify(key)
    if (normalized === posixify(abs) || normalized.endsWith(`/${needle}`)) {
      return src
    }
  }

  return ''
}
