window.reportData = {
  html: {
    verbose: true,
    skipEmpty: false,
    metricsToShow: ["lines", "branches", "functions"],
  },
  istanbul: {
    watermarks: {
      statements: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      lines: [50, 80],
    },
  },
  stats: {
    coverageFileCount: 3,
    sourceFileCount: 3,
  },
  coverage: {},
  sources: {},
};
