/** Keep in sync with packages/report-component/src/paths.ts */

function posixify(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function dirName(filePath: string): string {
  const normalized = posixify(filePath).replace(/\/+$/, "");
  if (normalized === "" || normalized === "/") {
    return "";
  }
  const index = normalized.lastIndexOf("/");
  if (index === -1) {
    return "";
  }
  if (index === 0) {
    return "/";
  }
  return normalized.slice(0, index);
}

/**
 * Walk up from each file's parent until every path shares a single directory.
 */
export function resolveInstrumentCwd(filePaths: readonly string[]): string {
  if (filePaths.length === 0) {
    return "";
  }

  let dirs = filePaths.map((filePath) => dirName(filePath));
  if (dirs.some((dir) => dir === "")) {
    return "";
  }

  while (new Set(dirs).size > 1) {
    const next = dirs.map(dirName);
    if (next.some((dir) => dir === "")) {
      return "";
    }
    dirs = next;
  }

  return dirs[0] ?? "";
}
