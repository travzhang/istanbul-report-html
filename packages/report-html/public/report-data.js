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
    coverageFileCount: 4,
    sourceFileCount: 4,
  },
  instrumentCwd: "",
  coverage: {
    "src/index.ts": {
      path: "src/index.ts",
      statementMap: {
        "0": { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        "1": { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } },
        "2": { start: { line: 3, column: 0 }, end: { line: 3, column: 40 } },
        "3": { start: { line: 4, column: 0 }, end: { line: 4, column: 40 } },
        "4": { start: { line: 5, column: 0 }, end: { line: 5, column: 40 } },
        "5": { start: { line: 6, column: 0 }, end: { line: 6, column: 40 } },
        "6": { start: { line: 7, column: 0 }, end: { line: 7, column: 40 } },
        "7": { start: { line: 8, column: 0 }, end: { line: 8, column: 40 } },
      },
      fnMap: {},
      branchMap: {},
      s: { "0": 1, "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 0, "7": 0 },
      f: {},
      b: {},
    },
    "src/utils.ts": {
      path: "src/utils.ts",
      statementMap: {
        "0": { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        "1": { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } },
        "2": { start: { line: 3, column: 0 }, end: { line: 3, column: 40 } },
        "3": { start: { line: 4, column: 0 }, end: { line: 4, column: 40 } },
        "4": { start: { line: 5, column: 0 }, end: { line: 5, column: 40 } },
        "5": { start: { line: 6, column: 0 }, end: { line: 6, column: 40 } },
      },
      fnMap: {},
      branchMap: {},
      s: { "0": 1, "1": 1, "2": 1, "3": 0, "4": 0, "5": 0 },
      f: {},
      b: {},
    },
    "src/jsx/dom/render.ts": {
      path: "src/jsx/dom/render.ts",
      statementMap: {
        "0": { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        "1": { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } },
        "2": { start: { line: 3, column: 0 }, end: { line: 3, column: 40 } },
        "3": { start: { line: 4, column: 0 }, end: { line: 4, column: 40 } },
      },
      fnMap: {},
      branchMap: {
        "0": { loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } } },
      },
      s: { "0": 1, "1": 1, "2": 0, "3": 0 },
      f: {},
      b: { "0": [1, 0] },
    },
    "build/index.js": {
      path: "build/index.js",
      statementMap: {
        "0": { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        "1": { start: { line: 2, column: 0 }, end: { line: 2, column: 40 } },
        "2": { start: { line: 3, column: 0 }, end: { line: 3, column: 40 } },
      },
      fnMap: {},
      branchMap: {},
      s: { "0": 1, "1": 1, "2": 0 },
      f: {},
      b: {},
    },
  },
  sources: {
    "src/index.ts":
      "export { Hono } from './hono-base'\nexport { Context } from './context'\n\nexport function createApp() {\n  return new Hono()\n}\n",
    "src/utils.ts":
      "export function toArray(value) {\n  return Array.isArray(value) ? value : [value]\n}\n",
    "src/jsx/dom/render.ts":
      "export function render(node) {\n  if (node == null) {\n    return ''\n  }\n  return String(node)\n}\n",
    "build/index.js":
      '"use strict";\nexports.Hono = require("./hono-base").Hono;\n',
  },
};
