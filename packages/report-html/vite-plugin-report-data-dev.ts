import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

import { REPORT_DATA_PLACEHOLDER } from "./report-data-placeholder.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

function readDevReportData(): string {
  const mockPath = path.join(packageRoot, "public/report-data.js");
  if (!fs.existsSync(mockPath)) {
    return "null";
  }

  const content = fs.readFileSync(mockPath, "utf-8");
  const match = content.match(/window\.reportData\s*=\s*([\s\S]+?);?\s*$/);
  if (!match) {
    return "null";
  }

  return match[1].trim().replace(/;\s*$/, "");
}

/** Injects mock coverage data from public/report-data.js during dev. */
export function reportDataDevPlugin(): Plugin {
  return {
    name: "report-data-dev",
    apply: "serve",
    transformIndexHtml(html) {
      return html.replace(REPORT_DATA_PLACEHOLDER, readDevReportData());
    },
  };
}
