import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

import { reportDataDevPlugin } from "./vite-plugin-report-data-dev.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reportDataDevPlugin(), viteSingleFile()],
});
