import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

import type { FileCoverageData } from "istanbul-lib-coverage";
import type { Watermarks } from "istanbul-lib-report";

import type { HtmlOptions } from "./index";

const require = createRequire(import.meta.url);

/** Must stay in sync with packages/report-html/report-data-placeholder.ts */
const REPORT_DATA_PLACEHOLDER = "__REPORT_DATA__";

/** coverage data keyed by absolute file path */
export type CoverageData = Record<string, FileCoverageData>;

/** html report options embedded in the HTML report (`linkMapper` is omitted) */
export type SerializableHtmlOptions = Omit<HtmlOptions, "linkMapper">;

/** istanbul context fields passed into {@link CoverageReport.generate} */
export interface IstanbulReportContext {
  watermarks: Watermarks;
}

/** summary counts shown in the HTML report UI */
export interface ReportStats {
  coverageFileCount: number;
  sourceFileCount: number;
}

/** input to {@link CoverageReport.generate} */
export interface GenerateOptions {
  coverage: CoverageData;
  targetDir: string;
  sourceFinder: (filePath: string) => string;
  istanbul: IstanbulReportContext;
}

/** serialized payload embedded in the HTML report */
export interface ReportData {
  html: SerializableHtmlOptions;
  istanbul: IstanbulReportContext;
  stats: ReportStats;
  coverage: CoverageData;
  sources: Record<string, string>;
}

/** @deprecated use {@link ReportData} */
export type CovData = ReportData;

/** output from {@link CoverageReport.generate} */
export interface GenerateResult {
  reportData: ReportData;
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

function serializeReportData(reportData: ReportData): string {
  return JSON.stringify(reportData).replace(/</g, "\\u003c");
}

function writeHtmlReport(
  reportData: ReportData,
  targetDir: string,
  reportHtmlDist: string,
): string {
  const template = fs.readFileSync(path.join(reportHtmlDist, "index.html"), "utf-8");
  if (!template.includes(REPORT_DATA_PLACEHOLDER)) {
    throw new Error(`HTML template missing ${REPORT_DATA_PLACEHOLDER} placeholder`);
  }

  const html = template.replace(REPORT_DATA_PLACEHOLDER, serializeReportData(reportData));
  const htmlReportPath = path.join(targetDir, "index.html");
  fs.writeFileSync(htmlReportPath, html, "utf-8");

  return htmlReportPath;
}

export class CoverageReport {
  private htmlOptions: HtmlOptions;

  constructor(htmlOptions: HtmlOptions = {}) {
    this.htmlOptions = htmlOptions;
  }

  buildReportData(
    coverage: CoverageData,
    sourceFinder: (filePath: string) => string,
    istanbul: IstanbulReportContext,
  ): ReportData {
    const sources: Record<string, string> = {};

    for (const filePath of Object.keys(coverage)) {
      try {
        sources[filePath] = sourceFinder(filePath);
      } catch {
        // skip files whose source cannot be resolved
      }
    }

    const { linkMapper: _linkMapper, ...html } = this.htmlOptions;

    return {
      html,
      istanbul,
      stats: {
        coverageFileCount: Object.keys(coverage).length,
        sourceFileCount: Object.keys(sources).length,
      },
      coverage,
      sources,
    };
  }

  async generate({
    coverage,
    targetDir,
    sourceFinder,
    istanbul,
  }: GenerateOptions): Promise<GenerateResult> {
    const reportData = this.buildReportData(coverage, sourceFinder, istanbul);

    fs.mkdirSync(targetDir, { recursive: true });

    let htmlReportPath: string | undefined;
    const reportHtmlDist = resolveReportHtmlDist();
    if (reportHtmlDist) {
      htmlReportPath = writeHtmlReport(reportData, targetDir, reportHtmlDist);
      if (this.htmlOptions.verbose) {
        console.log(`HTML report written to ${htmlReportPath}`);
      }
    } else if (this.htmlOptions.verbose) {
      console.log("canyonjs-dev-report-html not found, skipping HTML report generation");
    }

    return htmlReportPath !== undefined ? { reportData, htmlReportPath } : { reportData };
  }
}
