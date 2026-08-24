import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

import { reportDataDevPlugin } from "./vite-plugin-report-data-dev.js";

const require = createRequire(import.meta.url);
const monacoCss = join(dirname(require.resolve("monaco-editor")), "../../min/vs/editor/editor.main.css");

export default defineConfig({
  plugins: [react(), reportDataDevPlugin(), viteSingleFile()],
  resolve: {
    alias: {
      "monaco-editor-css": monacoCss,
    },
  },
});
