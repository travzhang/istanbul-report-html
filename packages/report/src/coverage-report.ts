import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

import type { FileCoverageData } from "istanbul-lib-coverage";
import type { Context, Summarizers, Watermarks } from "istanbul-lib-report";

import type { HtmlOptions } from "./index";
import { resolveInstrumentCwd } from "./instrument-cwd";

const require = createRequire(import.meta.url);

/** Must stay in sync with packages/report-html/report-data-placeholder.ts */
const REPORT_DATA_PLACEHOLDER = "__REPORT_DATA__";

/** coverage data keyed by absolute file path */
export type CoverageData = Record<string, FileCoverageData>;

/** html report options embedded in the HTML report (`linkMapper` is omitted) */
export type SerializableHtmlOptions = Omit<HtmlOptions, "linkMapper">;

/** serializable subset of istanbul `createContext` options plus report tree config */
export interface IstanbulReportContext {
  /** output directory from {@link Context.dir} */
  dir: string;
  /** low/high percentage thresholds from {@link Context.watermarks} */
  watermarks: Watermarks;
  /** default tree from `createContext({ defaultSummarizer })` */
  defaultSummarizer: Summarizers;
  /** tree chosen by this report via `ReportBase` `summarizer` option */
  summarizer?: Summarizers;
  /** whether context uses istanbul's filesystem lookup or a custom `sourceFinder` */
  sourceFinder: "filesystem" | "custom";
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
  /** common absolute directory of all coverage files; UI paths are relative to this */
  instrumentCwd: string;
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

interface ContextWithSummarizerFactory extends Context {
  _summarizerFactory?: {
    _defaultSummarizer: Summarizers;
  };
}

function serializeHtmlOptions(options: HtmlOptions): SerializableHtmlOptions {
  const html: SerializableHtmlOptions = {};

  if (options.verbose !== undefined) {
    html.verbose = options.verbose;
  }
  if (options.subdir !== undefined) {
    html.subdir = options.subdir;
  }
  if (options.skipEmpty !== undefined) {
    html.skipEmpty = options.skipEmpty;
  }
  if (options.metricsToShow !== undefined) {
    html.metricsToShow = options.metricsToShow;
  }

  return html;
}

function getSourceFinderKind(sourceFinder: (filePath: string) => string): "filesystem" | "custom" {
  const { name } = sourceFinder;
  if (name === "defaultSourceLookup" || name === "bound defaultSourceLookup") {
    return "filesystem";
  }

  return "custom";
}

/** extract serializable istanbul context fields for the HTML report */
export function extractIstanbulContext(
  context: Context,
  summarizer?: Summarizers,
): IstanbulReportContext {
  const defaultSummarizer =
    (context as ContextWithSummarizerFactory)._summarizerFactory?._defaultSummarizer ?? "pkg";

  return {
    dir: context.dir,
    watermarks: context.watermarks,
    defaultSummarizer,
    sourceFinder: getSourceFinderKind(context.sourceFinder),
    ...(summarizer !== undefined ? { summarizer } : {}),
  };
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

    const instrumentCwd = resolveInstrumentCwd(
      Object.entries(coverage).map(([key, data]) => data.path || key),
    );

    return {
      html: serializeHtmlOptions(this.htmlOptions),
      istanbul,
      stats: {
        coverageFileCount: Object.keys(coverage).length,
        sourceFileCount: Object.keys(sources).length,
      },
      instrumentCwd,
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
