/** POSIX-ify slashes; keep a leading `/` so absolute Unix paths stay absolute. */
export function posixify(filePath: string): string {
  return filePath.replaceAll('\\', '/')
}

/** Strip `instrumentCwd/` prefix (same idea as canyon: `path.replace(`${cwd}/`, '')`). */
export function toRelativePath(filePath: string, instrumentCwd: string): string {
  const abs = posixify(filePath)
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (!cwd) {
    return abs
  }
  if (abs === cwd) {
    return ''
  }
  const prefix = `${cwd}/`
  return abs.startsWith(prefix) ? abs.slice(prefix.length) : abs
}

export function toAbsolutePath(relPath: string, instrumentCwd: string): string {
  const rel = posixify(relPath).replace(/^\//, '')
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (!cwd) {
    return rel
  }
  if (!rel) {
    return cwd
  }
  if (cwd === '/') {
    return `/${rel}`
  }
  return `${cwd}/${rel}`
}

export function cwdBaseName(instrumentCwd: string): string {
  const cwd = posixify(instrumentCwd).replace(/\/+$/, '')
  if (!cwd || cwd === '/') {
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
  if (!needle) {
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
