import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

import type { FileCoverageData } from "istanbul-lib-coverage";

import type { HtmlOptions } from "./index";

const require = createRequire(import.meta.url);

/** coverage data keyed by absolute file path */
export type CoverageData = Record<string, FileCoverageData>;

/** html options persisted to `cov-data.json` (`linkMapper` is omitted) */
export type SerializableHtmlOptions = Omit<HtmlOptions, "linkMapper">;

/** input to {@link CoverageReport.generate} */
export interface GenerateOptions {
  coverage: CoverageData;
  targetDir: string;
  sourceFinder: (filePath: string) => string;
}

/** serialized payload written to `cov-data.json` */
export interface CovData {
  options: SerializableHtmlOptions;
  coverage: CoverageData;
  sources: Record<string, string>;
}

/** output from {@link CoverageReport.generate} */
export interface GenerateResult {
  reportPath: string;
  reportData: CovData;
  htmlReportPath?: string;
}

function resolveReportHtmlDist(): string | null {
  try {
    const packageJsonPath = require.resolve("canyonjs-dev-report-html/package.json");
    const distDir = path.join(path.dirname(packageJsonPath), "dist");
    if (fs.existsSync(path.join(distDir, "index.html"))) {
      return distDir;
    }
  } catch {
    // canyonjs-dev-report-html is not installed or dist is missing
  }

  return null;
}

function writeHtmlReport(
  reportData: CovData,
  targetDir: string,
  reportHtmlDist: string,
): string {
  fs.copyFileSync(
    path.join(reportHtmlDist, "index.html"),
    path.join(targetDir, "index.html"),
  );
  fs.writeFileSync(
    path.join(targetDir, "report-data.js"),
    `window.reportData = ${JSON.stringify(reportData)};\n`,
    "utf-8",
  );

  return path.join(targetDir, "index.html");
}

export class CoverageReport {
  private options: HtmlOptions;

  constructor(options: HtmlOptions = {}) {
    this.options = options;
  }

  buildReportData(coverage: CoverageData, sourceFinder: (filePath: string) => string): CovData {
    const sources: Record<string, string> = {};

    for (const filePath of Object.keys(coverage)) {
      try {
        sources[filePath] = sourceFinder(filePath);
      } catch {
        // skip files whose source cannot be resolved
      }
    }

    const { linkMapper: _linkMapper, ...options } = this.options;

    return { options, coverage, sources };
  }

  async generate({ coverage, targetDir, sourceFinder }: GenerateOptions): Promise<GenerateResult> {
    const reportData = this.buildReportData(coverage, sourceFinder);

    fs.mkdirSync(targetDir, { recursive: true });
    const reportPath = path.join(targetDir, "cov-data.json");
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf-8");

    let htmlReportPath: string | undefined;
    const reportHtmlDist = resolveReportHtmlDist();
    if (reportHtmlDist) {
      htmlReportPath = writeHtmlReport(reportData, targetDir, reportHtmlDist);
      if (this.options.verbose) {
        console.log(`HTML report written to ${htmlReportPath}`);
      }
    } else if (this.options.verbose) {
      console.log("canyonjs-dev-report-html not found, skipping HTML report generation");
    }

    return htmlReportPath !== undefined
      ? { reportPath, reportData, htmlReportPath }
      : { reportPath, reportData };
  }
}
