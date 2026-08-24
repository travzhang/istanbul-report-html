import { coverageLines, makeFileCoverage } from '../../src/make-coverage'
import type { FileCoverageData } from '../../src/types'

const srcIndex = `export { Hono } from './hono-base'
export { Context } from './context'

export function createApp() {
  return new Hono()
}
`

const srcUtils = `export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean)
}
`

const srcCompose = `export function compose(middleware: Function[]) {
  return async function composed(context: unknown, next?: Function) {
    let index = -1
    async function dispatch(i: number): Promise<void> {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      index = i
      const fn = middleware[i] ?? next
      if (fn) {
        await fn(context, () => dispatch(i + 1))
      }
    }
    await dispatch(0)
  }
}
`

const srcContext = `export class Context {
  req: Request
  status = 200

  constructor(request: Request) {
    this.req = request
  }

  json(data: unknown, status = 200) {
    this.status = status
    return Response.json(data, { status })
  }

  text(body: string, status = 200) {
    this.status = status
    return new Response(body, { status })
  }
}
`

const srcRequest = `export function getPath(request: Request): string {
  const url = new URL(request.url)
  return url.pathname
}

export function getQuery(request: Request, key: string): string | undefined {
  const url = new URL(request.url)
  return url.searchParams.get(key) ?? undefined
}
`

const srcRouter = `export class Router {
  private routes: Array<{ method: string; path: string; handler: Function }> = []

  add(method: string, path: string, handler: Function) {
    this.routes.push({ method, path, handler })
  }

  match(method: string, path: string) {
    return this.routes.find((route) => route.method === method && route.path === path)
  }
}
`

const srcHonoBase = `import { compose } from './compose'
import { Context } from './context'
import { Router } from './router'

export class Hono {
  private router = new Router()
  private middleware: Function[] = []

  use(fn: Function) {
    this.middleware.push(fn)
    return this
  }

  get(path: string, handler: Function) {
    this.router.add('GET', path, handler)
    return this
  }

  fetch = async (request: Request) => {
    const composed = compose(this.middleware)
    const context = new Context(request)
    await composed(context)
    return context.text('ok')
  }
}
`

const srcRender = `export function render(node: unknown): string {
  if (node == null) {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  return ''
}

export function renderToString(node: unknown): string {
  return render(node)
}
`

const srcAdapter = `export function getRequestListener(fetchFn: (request: Request) => Promise<Response>) {
  return async (req: Request) => fetchFn(req)
}
`

const buildIndex = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hono = void 0;
const hono_base_1 = require("./hono-base");
exports.Hono = hono_base_1.Hono;
`

export const mockSources: Record<string, string> = {
  'src/index.ts': srcIndex,
  'src/utils.ts': srcUtils,
  'src/compose.ts': srcCompose,
  'src/context.ts': srcContext,
  'src/request.ts': srcRequest,
  'src/router.ts': srcRouter,
  'src/hono-base.ts': srcHonoBase,
  'src/jsx/dom/render.ts': srcRender,
  'src/adapter.ts': srcAdapter,
  'build/index.js': buildIndex,
}

export const mockCoverage: Record<string, FileCoverageData> = {
  'src/index.ts': makeFileCoverage('src/index.ts', coverageLines(6, 2)),
  'src/utils.ts': makeFileCoverage('src/utils.ts', coverageLines(8, 2)),
  'src/compose.ts': makeFileCoverage('src/compose.ts', coverageLines(12, 4)),
  'src/context.ts': makeFileCoverage('src/context.ts', coverageLines(14, 4)),
  'src/request.ts': makeFileCoverage(
    'src/request.ts',
    coverageLines(8, 4),
    [[3, [1, 0]]],
  ),
  'src/router.ts': makeFileCoverage('src/router.ts', coverageLines(10, 3)),
  'src/hono-base.ts': makeFileCoverage('src/hono-base.ts', coverageLines(22, 8)),
  'src/jsx/dom/render.ts': makeFileCoverage(
    'src/jsx/dom/render.ts',
    coverageLines(9, 6),
    [[4, [1, 0]]],
  ),
  'src/adapter.ts': makeFileCoverage('src/adapter.ts', coverageLines(4, 1)),
  'build/index.js': makeFileCoverage('build/index.js', coverageLines(32, 16)),
}
