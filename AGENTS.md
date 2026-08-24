# AGENTS.md

面向 AI Agent 的本仓库开发指南。修改代码前请先阅读本文。

## 项目概述

这是一个 **pnpm monorepo**，为 Istanbul 覆盖率提供自定义 HTML 报告能力。根包 `canyonjs-dev-istanbul-report-html` 为 private，仅用于 workspace 管理；对外发布的是 `packages/` 下三个 npm 包。

## 包依赖关系

```
canyonjs-dev-report-component
        ↓ 构建时打入 bundle（devDependency + Vite 打包）
canyonjs-dev-report-html
        ↓ 运行时 require.resolve（optionalDependency）
canyonjs-dev-report
```

| 包名 | 目录 | 构建工具 | 发布内容 |
|------|------|----------|----------|
| `canyonjs-dev-report-component` | `packages/report-component` | tsdown (ESM) | `dist/` |
| `canyonjs-dev-report-html` | `packages/report-html` | Vite + singlefile | `dist/index.html`（含 `__REPORT_DATA__` 占位符） |
| `canyonjs-dev-report` | `packages/report` | tsdown (CJS) | `dist/index.cjs` |

**关键约束：**

- `report-html` 构建时已内联 `report-component`，npm 使用方**不需要**单独安装 component
- `report` 通过 `optionalDependencies` 依赖 `report-html`；未安装时跳过 HTML，不写任何文件（JSON 请用 Istanbul 内置 `json` reporter）
- monorepo 内用 `workspace:*`；`pnpm publish` 时自动转为精确版本号

## 构建顺序

**必须**按依赖顺序构建，不可并行：

```bash
pnpm --filter canyonjs-dev-report-component build
pnpm --filter canyonjs-dev-report-html build
pnpm --filter canyonjs-dev-report build
```

根目录 `pnpm build` 已封装上述顺序。

## 核心文件

| 文件 | 职责 |
|------|------|
| `packages/report/src/index.ts` | `HtmlReport` 类，继承 `istanbul-lib-report` 的 `ReportBase`（**尽量别动**，见下方说明） |
| `packages/report/src/coverage-report.ts` | 解析 `canyonjs-dev-report-html` dist，注入数据写出单文件 `index.html` |
| `packages/report-html/src/App.tsx` | 报告 UI 入口，读取 `window.reportData` |
| `packages/report-html/vite.config.ts` | 使用 `vite-plugin-singlefile` 输出单文件 HTML |
| `packages/report/vitest.config.ts` | 示例：将 `dist/index.cjs` 注册为 istanbul reporter |
| `bump.config.ts` | 同步 bump 4 个 package.json 版本（bumpp 默认识别此文件名） |
| `.github/workflows/publish.yml` | tag `v*` 触发，按 component → html → report 顺序发布 |

## 覆盖率报告生成流程

1. `HtmlReport.onDetail()` 收集各文件 `FileCoverageData`
2. `HtmlReport.onEnd()` 调用 `CoverageReport.generate()`
3. `buildReportData()` 组装 `{ html, istanbul, stats, coverage, sources }`（UI 只展示 options 与 stats 数量，不展示完整 coverage/source）
4. `resolveReportHtmlDist()` 尝试 `require.resolve("canyonjs-dev-report-html/package.json")`
5. 成功则读取 `dist/index.html` 模板，将 `__REPORT_DATA__` 替换为 JSON，写入 `targetDir/index.html`

**参数分层：**

- `HtmlReport` 构造函数的 `HtmlOptions`：HTML 报告专属（`verbose`、`linkMapper`、`subdir`、`skipEmpty`、`metricsToShow`）
- `generate()` 的 `istanbul`：来自 istanbul `Context`（如 `watermarks`），与 HTML options 分开传入

## 编码规范

### `packages/report/src/index.ts`

- **尽量别动**。该文件是 Istanbul reporter 的薄封装入口，只负责收集覆盖率并委托给 `CoverageReport`
- 报告生成、HTML 注入、文件写出等逻辑一律放在 `packages/report/src/coverage-report.ts`
- 只有 istanbul 生命周期钩子签名变更、对外导出类型调整等不得不改入口时才动 `index.ts`

### TypeScript

- `packages/report` 继承 `@tsconfig/strictest`，含 `exactOptionalPropertyTypes: true`
- 可选属性**不能**显式赋 `undefined`；应省略字段或使用条件展开：

```ts
return htmlReportPath !== undefined ? { reportData, htmlReportPath } : { reportData };
```

### 包名引用

所有 npm 包名带 `canyonjs-dev-` 前缀。修改包名时需同步更新：

- 各 `package.json` 的 `name` 和 workspace 依赖
- `coverage-report.ts` 中的 `require.resolve(...)`
- `report-html/src/App.tsx` 的 import
- 根 `package.json` 和 CI 中的 `--filter` 参数

### 目录名 vs 包名

目录保持 `packages/report-component` 等短名；pnpm filter 和 import 使用完整 npm 包名 `canyonjs-dev-*`。

## 版本与发布

- 四个 `package.json`（含根目录）版本由 bumpp 统一管理
- 配置文件必须命名为 **`bump.config.ts`**（不是 `bumpp.config.ts`），或在命令中显式传 `--configFilePath bump.config.ts`
- 发布脚本：`pnpm release:patch` → `git push && git push --tags`
- CI 需要 secret：`NPM_TOKEN`
- 各 publishable 包的 `files` 字段仅含 `dist`，不含源码
- 不要提交 `packages/*/dist/` 和 `packages/report/coverage/`（已在各自 `.gitignore`）

## 常见修改场景

### 修改报告 UI

1. 改 `packages/report-component/src/` 或 `packages/report-html/src/`
2. `pnpm build:report-html`
3. 运行 `pnpm --filter canyonjs-dev-report test` 验证 `coverage/index.html`

### 修改 reporter 逻辑

1. 改 `packages/report/src/coverage-report.ts`（**不要**改 `index.ts`，除非 istanbul 入口本身必须调整）
2. `pnpm --filter canyonjs-dev-report build`
3. 运行测试确认 `index.html` 输出

### 新增 workspace 依赖

- 构建时依赖 → `devDependencies` + `workspace:*`
- 运行时依赖 → `dependencies` 或 `optionalDependencies` + `workspace:*`
- 发布后会转为精确版本；确保 bumpp 同步版本号

### 添加新 publishable 包

1. 在 `packages/` 下创建包，`publishConfig.access: "public"`，`files: ["dist"]`
2. 加入 `bump.config.ts` 的 `files` 数组
3. 更新 `publish.yml` 发布顺序
4. 更新本文件和 README.md

## 测试

```bash
# report 包集成测试（含覆盖率 reporter 验证）
pnpm --filter canyonjs-dev-report test
```

测试会在 `packages/report/coverage/` 生成报告产物，可用于验证 HTML 集成。

## 注意事项

- `report-html` 的 `dist/index.html` 含 `__REPORT_DATA__` 占位符，由 reporter 在写入 coverage 目录时替换
- `prepublishOnly` 在各包内触发 build；CI 也会先 `pnpm build`
- 根目录版本号（如 `1.0.1`）与子包可能短暂不一致；发布前应运行 bumpp 对齐
- 不要使用 `git push --force` 到 main；发布依赖 tag 触发 CI

## 不要做的事

- 不要随意修改 `packages/report/src/index.ts`；reporter 业务逻辑放 `coverage-report.ts`
- 不要将 `report-html` 放入 `report` 的 `devDependencies`（发布后使用方装不到）
- 不要在未构建 `report-component` 的情况下构建 `report-html`
- 不要手动单独 bump 某个子包版本而跳过 bumpp
- 不要将 bumpp 配置文件命名为 `bumpp.config.ts`（bumpp 默认识别 `bump.config.ts`）
- 不要修改 npm 包名前缀 `canyonjs-dev-` 而不同步所有引用
