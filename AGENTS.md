# AGENTS.md

Development guide for AI agents working in this repository. Read this before changing code.

## Overview

This is a **pnpm monorepo** that provides a custom HTML coverage report for Istanbul. The root package `canyonjs-dev-istanbul-report-html` is private and only used for workspace management; the three publishable npm packages live under `packages/`.

## Package dependencies

```
canyonjs-dev-report-component
        ↓ bundled at build time (devDependency + Vite)
canyonjs-dev-report-html
        ↓ require.resolve at runtime (optionalDependency)
canyonjs-dev-report
```

| Package | Directory | Build tool | Published artifacts |
|---------|-----------|------------|---------------------|
| `canyonjs-dev-report-component` | `packages/report-component` | tsdown (ESM) | `dist/` |
| `canyonjs-dev-report-html` | `packages/report-html` | Vite + singlefile | `dist/index.html` (contains `__REPORT_DATA__` placeholder) |
| `canyonjs-dev-report` | `packages/report` | tsdown (CJS) | `dist/index.cjs` |

**Key constraints:**

- `report-html` inlines `report-component` at build time; npm consumers do **not** need to install the component package separately
- `report` depends on `report-html` via `optionalDependencies`; if it is not installed, HTML generation is skipped and no files are written (use Istanbul's built-in `json` reporter for JSON)
- Inside the monorepo, use `workspace:*`; `pnpm publish` rewrites these to exact versions

## Build order

**Must** build in dependency order; do not build in parallel:

```bash
pnpm --filter canyonjs-dev-report-component build
pnpm --filter canyonjs-dev-report-html build
pnpm --filter canyonjs-dev-report build
```

Root `pnpm build` already runs this sequence.

## Core files

| File | Role |
|------|------|
| `packages/report/src/index.ts` | `HtmlReport` class extending `istanbul-lib-report`'s `ReportBase` (**avoid changing**; see below) |
| `packages/report/src/coverage-report.ts` | Resolves `canyonjs-dev-report-html` dist, injects data, writes single-file `index.html` |
| `packages/report-html/src/App.tsx` | Report UI entry; reads `window.reportData` |
| `packages/report-html/vite.config.ts` | Uses `vite-plugin-singlefile` to emit a single HTML file |
| `packages/report/vitest.config.ts` | Example: registers `dist/index.cjs` as an Istanbul reporter |
| `bump.config.ts` | Syncs versions across 4 package.json files (bumpp looks for this filename by default) |
| `.github/workflows/publish.yml` | Triggered by `v*` tags; publishes component → html → report |

## Coverage report generation flow

1. `HtmlReport.onDetail()` collects each file's `FileCoverageData`
2. `HtmlReport.onEnd()` calls `CoverageReport.generate()`
3. `buildReportData()` assembles `{ html, istanbul, stats, coverage, sources }` (UI shows options and stats counts only, not full coverage/source)
4. `resolveReportHtmlDist()` tries `require.resolve("canyonjs-dev-report-html/package.json")`
5. On success, reads `dist/index.html`, replaces `__REPORT_DATA__` with JSON, writes `targetDir/index.html`

**Option layers:**

- `HtmlOptions` on the `HtmlReport` constructor: HTML-report-specific (`verbose`, `linkMapper`, `subdir`, `skipEmpty`, `metricsToShow`)
- `istanbul` passed to `generate()`: from the Istanbul `Context` (`dir`, `watermarks`, `defaultSummarizer`, `sourceFinder`) plus `ReportBase.summarizer`

## Coding guidelines

### `packages/report/src/index.ts`

- **Avoid changing this file.** It is a thin Istanbul reporter entry that only collects coverage and delegates to `CoverageReport`
- Put report generation, HTML injection, and file writing in `packages/report/src/coverage-report.ts`
- Only touch `index.ts` when Istanbul lifecycle hook signatures or public export types must change

### TypeScript

- `packages/report` extends `@tsconfig/strictest`, including `exactOptionalPropertyTypes: true`
- Optional properties **must not** be assigned `undefined` explicitly; omit the field or use conditional spreads:

```ts
return htmlReportPath !== undefined ? { reportData, htmlReportPath } : { reportData };
```

### Package name references

All npm package names use the `canyonjs-dev-` prefix. When renaming, update in sync:

- Each `package.json` `name` and workspace dependencies
- `require.resolve(...)` in `coverage-report.ts`
- Imports in `report-html/src/App.tsx`
- Root `package.json` and CI `--filter` arguments

### Directory names vs package names

Directories keep short names like `packages/report-component`; pnpm filters and imports use the full npm names `canyonjs-dev-*`.

## Versioning and publishing

- All four `package.json` files (including root) are versioned together via bumpp
- The config file **must** be named **`bump.config.ts`** (not `bumpp.config.ts`), or pass `--configFilePath bump.config.ts` explicitly
- Release script: `pnpm release:patch` → `git push && git push --tags`
- CI needs the `NPM_TOKEN` secret
- Publishable packages' `files` field should only include `dist`, not source
- Do not commit `packages/*/dist/` or `packages/report/coverage/` (already in each package's `.gitignore`)

## Common change scenarios

### Changing the report UI

1. Edit `packages/report-component/src/` or `packages/report-html/src/`
2. `pnpm build:report-html`
3. Run `pnpm --filter canyonjs-dev-report test` and verify `coverage/index.html`

### Changing reporter logic

1. Edit `packages/report/src/coverage-report.ts` (**do not** change `index.ts` unless the Istanbul entry itself must change)
2. `pnpm --filter canyonjs-dev-report build`
3. Run tests and confirm `index.html` output

### Adding a workspace dependency

- Build-time dependency → `devDependencies` + `workspace:*`
- Runtime dependency → `dependencies` or `optionalDependencies` + `workspace:*`
- After publish these become exact versions; ensure bumpp keeps versions aligned

### Adding a new publishable package

1. Create the package under `packages/`, set `publishConfig.access: "public"`, `files: ["dist"]`
2. Add it to the `files` array in `bump.config.ts`
3. Update publish order in `publish.yml`
4. Update this file and README.md

## Testing

```bash
# report package integration tests (includes coverage reporter verification)
pnpm --filter canyonjs-dev-report test
```

Tests write report artifacts under `packages/report/coverage/`, which can be used to verify HTML integration.

## Notes

- `report-html`'s `dist/index.html` contains a `__REPORT_DATA__` placeholder; the reporter replaces it when writing to the coverage directory
- `prepublishOnly` triggers build in each package; CI also runs `pnpm build` first
- Root version (e.g. `1.0.1`) may briefly diverge from subpackages; run bumpp before release to align
- Do not `git push --force` to main; publishing relies on tags triggering CI

## Do not

- Do not casually modify `packages/report/src/index.ts`; put reporter business logic in `coverage-report.ts`
- Do not put `report-html` in `report`'s `devDependencies` (consumers would not get it after publish)
- Do not build `report-html` without building `report-component` first
- Do not manually bump a single subpackage version and skip bumpp
- Do not name the bumpp config `bumpp.config.ts` (bumpp defaults to `bump.config.ts`)
- Do not change the `canyonjs-dev-` npm prefix without updating all references
