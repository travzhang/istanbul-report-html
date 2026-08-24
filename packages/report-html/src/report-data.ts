/** Keep in sync with packages/report/src/coverage-report.ts */
export interface ReportData {
  html: {
    verbose?: boolean;
    subdir?: string;
    skipEmpty?: boolean;
    metricsToShow?: ("lines" | "branches" | "functions" | "statements")[];
  };
  istanbul: {
    watermarks: {
      statements: [number, number];
      functions: [number, number];
      branches: [number, number];
      lines: [number, number];
    };
  };
  stats: {
    coverageFileCount: number;
    sourceFileCount: number;
  };
  coverage: Record<string, unknown>;
  sources: Record<string, string>;
}

declare global {
  interface Window {
    reportData?: ReportData;
  }
}

export {};
