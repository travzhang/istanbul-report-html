/** Keep in sync with packages/report/src/coverage-report.ts */
export interface ReportData {
  html: {
    verbose?: boolean;
    subdir?: string;
    skipEmpty?: boolean;
    metricsToShow?: ("lines" | "branches" | "functions" | "statements")[];
  };
  istanbul: {
    dir: string;
    watermarks: {
      statements: [number, number];
      functions: [number, number];
      branches: [number, number];
      lines: [number, number];
    };
    defaultSummarizer: "flat" | "nested" | "pkg" | "defaultSummarizer";
    summarizer?: "flat" | "nested" | "pkg" | "defaultSummarizer";
    sourceFinder: "filesystem" | "custom";
  };
  stats: {
    coverageFileCount: number;
    sourceFileCount: number;
  };
  /** common absolute directory of all coverage files; UI paths are relative to this */
  instrumentCwd: string;
  coverage: Record<string, unknown>;
  sources: Record<string, string>;
}

declare global {
  interface Window {
    reportData?: ReportData;
  }
}

export {};
