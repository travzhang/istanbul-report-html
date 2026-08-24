import { defineConfig } from "bumpp";

export default defineConfig({
  files: [
    "package.json",
    "packages/report-component/package.json",
    "packages/report-html/package.json",
    "packages/report/package.json",
  ],
  tag: true,
  commit: true,
  push: true,
  execute: "pnpm install",
});
