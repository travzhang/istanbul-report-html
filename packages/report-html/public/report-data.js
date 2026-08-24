window.reportData = {
  html: {
    verbose: true,
    skipEmpty: false,
    metricsToShow: ["lines", "branches", "functions"],
  },
  istanbul: {
    dir: "coverage",
    watermarks: {
      statements: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      lines: [50, 80],
    },
    defaultSummarizer: "pkg",
    sourceFinder: "filesystem",
  },
  stats: {
    coverageFileCount: 3,
    sourceFileCount: 3,
  },
  coverage: {},
  sources: {},
};
