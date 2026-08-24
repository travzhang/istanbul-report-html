import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/definitions/css/register'
import 'monaco-editor/languages/definitions/html/register'
import 'monaco-editor/languages/definitions/javascript/register'
import 'monaco-editor/languages/definitions/typescript/register'

export { monaco }

export function languageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts':
    case 'mts':
    case 'cts':
    case 'tsx':
      return 'typescript'
    case 'js':
    case 'mjs':
    case 'cjs':
    case 'jsx':
      return 'javascript'
    case 'css':
    case 'scss':
      return 'css'
    case 'html':
    case 'htm':
      return 'html'
    default:
      return 'plaintext'
  }
}
